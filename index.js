// index.js
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const { google } = require('googleapis');
const winston = require('winston');
const fs = require('fs');
const config = require('./config');
const RateLimiter = require('./lib/rateLimiter');
const { validateStreamingUrl } = require('./lib/urlValidator');
const { extractStreamingUrls, normalizeUrl, resolveTikTokUrl, detectPlatform, extractUsername } = require('./lib/platformDetector');
const { loadCitiesIntoCache, parseLocation, getCacheInfo } = require('./lib/locationParser');

// Logger setup
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: config.LOG_FILE })
  ]
});

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: config.GOOGLE_CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Discord client setup
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Twitch client setup
const twitch = new tmi.Client({
  channels: [config.TWITCH_CHANNEL]
});

// Ignore lists
let twitchUserIgnoreList = new Set();
let discordUserIgnoreList = new Set();
let urlIgnoreList = new Set();

// Existing URLs cache
let existingUrlsCache = new Set();

// Column mapping cache
let columnMapping = {};

// Known cities cache update interval
let knownCitiesInterval = null;

// Simple mutex for cache operations
let cacheUpdateInProgress = false;
const cacheMutex = {
  async acquire() {
    while (cacheUpdateInProgress) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    cacheUpdateInProgress = true;
  },
  release() {
    cacheUpdateInProgress = false;
  }
};

// Rate limiters
const userRateLimiter = new RateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS
});

// Fetch ignore lists from Google Sheets
async function fetchIgnoreLists() {
  logger.info('Fetching ignore lists from Google Sheets');

  // Fetch each list independently to handle partial failures
  try {
    const twitchResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_TWITCH_IGNORE}!A2:A` // Skip header row
    });

    twitchUserIgnoreList = new Set(
      (twitchResponse.data.values || [])
        .map(row => row[0]?.trim()?.toLowerCase())
        .filter(Boolean)
    );
    logger.info(`Loaded ${twitchUserIgnoreList.size} Twitch users to ignore list`);
  } catch (error) {
    logger.error(`Failed to fetch Twitch ignore list: ${error.message}`);
  }

  try {
    const discordResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_DISCORD_IGNORE}!A2:A` // Skip header row
    });

    discordUserIgnoreList = new Set(
      (discordResponse.data.values || [])
        .map(row => row[0]?.trim()?.toLowerCase())
        .filter(Boolean)
    );
    logger.info(`Loaded ${discordUserIgnoreList.size} Discord users to ignore list`);
  } catch (error) {
    logger.error(`Failed to fetch Discord ignore list: ${error.message}`);
  }

  try {
    const urlResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_URL_IGNORE}!A2:A` // Skip header row
    });

    urlIgnoreList = new Set(
      (urlResponse.data.values || [])
        .map(row => {
          const url = row[0]?.trim();
          return url ? normalizeUrl(url) : null;
        })
        .filter(Boolean)
    );
    logger.info(`Loaded ${urlIgnoreList.size} URLs to ignore list`);
  } catch (error) {
    logger.error(`Failed to fetch URL ignore list: ${error.message}`);
  }
}

// Fetch known cities from Google Sheets
async function fetchKnownCities() {
  try {
    logger.info('Fetching known cities from Google Sheets');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_KNOWN_CITIES}!A2:B` // Skip header row, get columns A (City) and B (State)
    });

    const cities = response.data.values || [];
    loadCitiesIntoCache(cities);

    const cacheInfo = getCacheInfo();
    logger.info(`Loaded ${cacheInfo.size} known cities into location parser cache`);
  } catch (error) {
    logger.error(`Failed to fetch known cities: ${error.message}`);
  }
}

// Fetch column headers and create mapping
async function fetchColumnMapping() {
  try {
    logger.info('Fetching column headers from Google Sheets');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_LIVESTREAMS}!1:1` // Get first row (headers)
    });

    const headers = response.data.values?.[0] || [];
    columnMapping = {};

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      columnMapping[normalizedHeader] = index;
    });

    logger.info(`Column mapping created: ${JSON.stringify(columnMapping)}`);
  } catch (error) {
    logger.error(`Failed to fetch column headers: ${error.message}`);
  }
}

// Fetch existing URLs from Google Sheets
async function fetchExistingUrls() {
  await cacheMutex.acquire();
  try {
    logger.info('Fetching existing URLs from Google Sheets');

    // Use column mapping to find the Link column
    const linkColumn = columnMapping[config.COLUMN_LINK.toLowerCase()];
    if (linkColumn === undefined) {
      logger.warn('Link column not found in mapping, using default column F');
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.GOOGLE_SHEET_ID,
        range: `${config.SHEET_TAB_LIVESTREAMS}!F2:F`
      });

      existingUrlsCache = new Set(
        (response.data.values || [])
          .map(row => row[0]?.trim())
          .filter(Boolean)
          .map(url => normalizeUrl(url))
      );
    } else {
      const columnLetter = String.fromCharCode(65 + linkColumn); // Convert index to letter
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.GOOGLE_SHEET_ID,
        range: `${config.SHEET_TAB_LIVESTREAMS}!${columnLetter}2:${columnLetter}`
      });

      existingUrlsCache = new Set(
        (response.data.values || [])
          .map(row => row[0]?.trim())
          .filter(Boolean)
          .map(url => normalizeUrl(url))
      );
    }

    logger.info(`Loaded ${existingUrlsCache.size} existing URLs from sheet`);
  } catch (error) {
    logger.error(`Failed to fetch existing URLs: ${error.message}`);
  } finally {
    cacheMutex.release();
  }
}

// Check if URL already exists in sheet
function isUrlInSheet(url) {
  const normalizedUrl = normalizeUrl(url);
  return existingUrlsCache.has(normalizedUrl);
}

// Add row to Google Sheet
async function addToSheet(data) {
  try {
    const timestamp = new Date().toISOString();

    // Create an empty row array based on the number of columns
    const maxColumn = Math.max(...Object.values(columnMapping)) + 1;
    const rowValues = new Array(maxColumn).fill('');

    // Map the data to the correct columns
    const setColumnValue = (columnName, value) => {
      const index = columnMapping[columnName.toLowerCase()];
      if (index !== undefined) {
        rowValues[index] = value;
      } else {
        logger.warn(`Column "${columnName}" not found in sheet headers`);
      }
    };

    // Set the values we want to add
    setColumnValue(config.COLUMN_SOURCE, data.source || '');
    setColumnValue(config.COLUMN_PLATFORM, data.platform || '');
    setColumnValue(config.COLUMN_STATUS, config.STATUS_NEW_LINK);
    setColumnValue(config.COLUMN_LINK, data.link || '');
    setColumnValue(config.COLUMN_ADDED_DATE, timestamp);
    setColumnValue(config.COLUMN_POSTED_BY, data.postedBy || '');
    setColumnValue(config.COLUMN_CITY, data.city || '');
    setColumnValue(config.COLUMN_STATE, data.state || '');

    logger.debug(`Adding to sheet: ${data.link}`);
    logger.debug(`Row values: ${JSON.stringify(rowValues)}`);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: `${config.SHEET_TAB_LIVESTREAMS}!A:A`, // Always append to column A to ensure rows start from the first column
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowValues] }
    });

    logger.info(`Added to sheet: ${data.link}`);
  } catch (error) {
    logger.error(`Error adding to sheet: ${error.message}`);
  }
}

// Process URLs
async function processUrl(url, source, postedBy, messageContent = '') {
  try {
    let normalizedUrl = normalizeUrl(url);

    // Resolve TikTok redirect URLs to their canonical form
    if (normalizedUrl.includes('tiktok.com/t/')) {
      const resolvedUrl = await resolveTikTokUrl(normalizedUrl);
      if (resolvedUrl !== normalizedUrl) {
        logger.info(`Resolved TikTok redirect: ${normalizedUrl} -> ${resolvedUrl}`);
        normalizedUrl = resolvedUrl;
      }
    }

    // Validate URL
    const validation = validateStreamingUrl(normalizedUrl);
    if (!validation.valid) {
      logger.warn(`Invalid URL rejected: ${normalizedUrl} - ${validation.reason}`);
      return { success: false, reason: 'invalid' };
    }

    // Check if URL is already in the sheet
    if (isUrlInSheet(normalizedUrl)) {
      logger.info(`URL already exists in sheet: ${normalizedUrl}`);
      return { success: false, reason: 'duplicate' };
    }

    const platform = detectPlatform(normalizedUrl);
    const username = extractUsername(normalizedUrl);

    // Parse location from message
    const locationInfo = parseLocation(messageContent);
    const city = locationInfo?.city || '';
    const state = locationInfo?.state || '';

    if (locationInfo) {
      logger.info(`Detected location: ${city}, ${state}`);
    }

    logger.info(`Adding new URL: ${normalizedUrl} from ${source}`);

    await addToSheet({
      platform: platform,
      link: normalizedUrl,
      postedBy: postedBy,
      source: username, // Will be null if not extractable
      city: city,
      state: state
    });

    // Add to cache to prevent immediate re-processing
    await cacheMutex.acquire();
    try {
      existingUrlsCache.add(normalizedUrl);
    } finally {
      cacheMutex.release();
    }

    return { success: true }; // Successfully added
  } catch (error) {
    logger.error(`Error processing URL: ${error.message}`);
    return { success: false, reason: 'error' };
  }
}

// Discord message handler
discord.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) {
      logger.info(`Ignoring message from bot: ${message.author.username}`);
      return;
    }

    // Check if user is in ignore list
    if (discordUserIgnoreList.has(message.author.username.toLowerCase())) {
      logger.info(`Ignoring message from Discord user: ${message.author.username}`);
      return;
    }

    // Check rate limit
    if (!userRateLimiter.isAllowed(`discord:${message.author.id}`)) {
      logger.warn(`Rate limit exceeded for Discord user: ${message.author.username}`);
      return;
    }

    if (message.channelId === config.DISCORD_CHANNEL_ID) {
      // Validate message length to prevent processing extremely long messages
      if (message.content.length > 2000) {
        logger.warn(`Message from ${message.author.username} too long (${message.content.length} chars), skipping`);
        return;
      }
      
      logger.info(`Received Discord message from ${message.author.username}: ${message.content}`);
      const urls = extractStreamingUrls(message.content);
      let anyUrlAdded = false;
      let anyDuplicate = false;
      let anyIgnored = false;

      // Process URLs
      for (const url of urls) {
        const normalizedUrl = normalizeUrl(url);

        // Check if URL is in ignore list
        if (urlIgnoreList.has(normalizedUrl)) {
          logger.info(`Ignoring URL from ignore list: ${normalizedUrl}`);
          anyIgnored = true;
          continue;
        }

        const result = await processUrl(url, 'Discord', message.author.username, message.content);
        if (result.success) {
          anyUrlAdded = true;
        } else if (result.reason === 'duplicate') {
          anyDuplicate = true;
        }
      }

      // Add appropriate reaction based on results (priority: success > ignored > duplicate)
      if (config.DISCORD_CONFIRM_REACTION) {
        try {
          let reaction = null;
          let reactionType = null;

          if (anyUrlAdded) {
            reaction = '✅';
            reactionType = 'checkmark';
          } else if (anyIgnored) {
            reaction = '❌';
            reactionType = 'ignored';
          } else if (anyDuplicate) {
            reaction = '🔁';
            reactionType = 'duplicate';
          }

          if (reaction) {
            await message.react(reaction);
            logger.info(`Added ${reactionType} reaction to Discord message from ${message.author.username}`);
          }
        } catch (error) {
          logger.error(`Failed to add reaction: ${error.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Error in Discord message handler: ${error.message}`, { error: error.stack });
  }
});

// Twitch message handler
twitch.on('message', async (channel, tags, message, self) => {
  try {
    if (self) return;

    // Check if user is in ignore list
    if (twitchUserIgnoreList.has(tags.username.toLowerCase())) {
      logger.info(`Ignoring message from Twitch user: ${tags.username}`);
      return;
    }

    // Check rate limit
    if (!userRateLimiter.isAllowed(`twitch:${tags['user-id']}`)) {
      logger.warn(`Rate limit exceeded for Twitch user: ${tags.username}`);
      return;
    }

    // Validate message length
    if (message.length > 500) {
      logger.warn(`Twitch message from ${tags.username} too long (${message.length} chars), skipping`);
      return;
    }
    
    const urls = extractStreamingUrls(message);
    let anyUrlAdded = false;
    let anyDuplicate = false;
    let anyIgnored = false;

    // Process URLs
    for (const url of urls) {
      const normalizedUrl = normalizeUrl(url);

      // Check if URL is in ignore list
      if (urlIgnoreList.has(normalizedUrl)) {
        logger.info(`Ignoring URL from ignore list: ${normalizedUrl}`);
        anyIgnored = true;
        continue;
      }

      const result = await processUrl(url, 'Twitch', tags.username, message);
      if (result.success) {
        anyUrlAdded = true;
      } else if (result.reason === 'duplicate') {
        anyDuplicate = true;
      }
    }

    // Send appropriate reply based on results (priority: success > ignored > duplicate)
    if (config.TWITCH_CONFIRM_REPLY) {
      try {
        let replyEmoji = '';
        let replyType = '';

        if (anyUrlAdded) {
          replyEmoji = '✅';
          replyType = 'checkmark';
        } else if (anyIgnored) {
          replyEmoji = '❌';
          replyType = 'ignored';
        } else if (anyDuplicate) {
          replyEmoji = '🔁';
          replyType = 'duplicate';
        }

        if (replyEmoji) {
          await twitch.say(channel, `@${tags.username} ${replyEmoji}`);
          logger.info(`Sent ${replyType} reply to Twitch user ${tags.username}`);
        }
      } catch (error) {
        logger.error(`Failed to send Twitch reply: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in Twitch message handler: ${error.message}`, { error: error.stack });
  }
});

// Start the application
async function start() {
  try {
    // Validate Google credentials exist
    if (!fs.existsSync(config.GOOGLE_CREDENTIALS_PATH)) {
      logger.error(`Google credentials file not found at: ${config.GOOGLE_CREDENTIALS_PATH}`);
      logger.error('Please ensure credentials.json exists or set GOOGLE_CREDENTIALS_PATH environment variable');
      process.exit(1);
    }

    // Start rate limiter cleanup
    userRateLimiter.startCleanup();

    // Initial fetch of column mapping first (needed for other fetches)
    await fetchColumnMapping();

    // Fetch other data in parallel for faster startup
    await Promise.all([
      fetchIgnoreLists(),
      fetchExistingUrls(),
      fetchKnownCities()
    ]);

    // Set up periodic sync
    const ignoreListInterval = setInterval(fetchIgnoreLists, config.IGNORE_LIST_SYNC_INTERVAL);
    const existingUrlsInterval = setInterval(async () => {
      await fetchColumnMapping(); // Refresh column mapping in case headers changed
      await fetchExistingUrls();
    }, config.EXISTING_URLS_SYNC_INTERVAL || 60000);
    const knownCitiesInterval = setInterval(fetchKnownCities, config.KNOWN_CITIES_SYNC_INTERVAL);
    logger.info(`Ignore lists will be synced every ${config.IGNORE_LIST_SYNC_INTERVAL / 1000} seconds`);
    logger.info(`Existing URLs and column mapping will be synced every ${(config.EXISTING_URLS_SYNC_INTERVAL || 60000) / 1000} seconds`);
    logger.info(`Known cities will be synced every ${config.KNOWN_CITIES_SYNC_INTERVAL / 1000} seconds`);

    // Connect Discord
    await discord.login(config.DISCORD_TOKEN);
    logger.info('Discord bot connected');

    // Connect Twitch
    await twitch.connect();
    logger.info('Twitch bot connected');

    logger.info('Application started successfully');

    // Store intervals for cleanup
    global.ignoreListInterval = ignoreListInterval;
    global.existingUrlsInterval = existingUrlsInterval;
    global.knownCitiesInterval = knownCitiesInterval;
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Clear intervals
  if (global.ignoreListInterval) {
    clearInterval(global.ignoreListInterval);
  }
  if (global.existingUrlsInterval) {
    clearInterval(global.existingUrlsInterval);
  }
  if (global.knownCitiesInterval) {
    clearInterval(global.knownCitiesInterval);
  }

  // Stop rate limiter cleanup
  userRateLimiter.stopCleanup();

  // Disconnect services
  try {
    discord.destroy();
    await twitch.disconnect();
    logger.info('All services disconnected successfully');
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
  }

  process.exit(0);
}

// Handle various shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker stop, Kubernetes pod termination
process.on('SIGHUP', () => shutdown('SIGHUP'));   // Terminal closed
process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Sometimes used by process managers

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`, { stack: error.stack });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

start();