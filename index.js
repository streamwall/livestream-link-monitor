// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const { google } = require('googleapis');
const winston = require('winston');
const pLimit = require('p-limit');
const config = require('./config');
const BrowserPool = require('./lib/browserPool');
const RateLimiter = require('./lib/rateLimiter');
const { validateStreamingUrl } = require('./lib/urlValidator');
const { extractStreamingUrls, normalizeUrl, detectPlatform } = require('./lib/platformDetector');
const { checkLiveStatus } = require('./lib/liveChecker');

const delay = ms => new Promise(r => setTimeout(r, ms));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
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

// Browser pool
const browserPool = new BrowserPool({ 
  maxBrowsers: config.MAX_BROWSERS,
  logger 
});

// Rate limiters
const userRateLimiter = new RateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS
});

// Concurrency limiter
const processLimit = pLimit(config.MAX_CONCURRENT_CHECKS);

// Fetch ignore lists from Google Sheets
async function fetchIgnoreLists() {
  logger.info('Fetching ignore lists from Google Sheets');
  
  // Fetch each list independently to handle partial failures
  try {
    const twitchResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: 'Twitch User Ignorelist!A2:A' // Skip header row
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
      range: 'Discord User Ignorelist!A2:A' // Skip header row
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
      range: 'URL Ignorelist!A2:A' // Skip header row
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


// Check if URL is a live stream using Playwright
async function isLiveStream(url) {
  return browserPool.withBrowser(async (browser) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    try {
      const page = await context.newPage();
      logger.info(`Checking URL: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const platform = detectPlatform(url);
      logger.info(`Detected platform: ${platform}`);

      const { isLive, title } = await checkLiveStatus(page, platform);

      logger.info(`Is live: ${isLive}, Title: ${title}`);
      return { isLive, title };

    } catch (error) {
      logger.error(`Error checking if live: ${error.message}`);
      return { isLive: false, title: '' };
    } finally {
      await context.close();
    }
  });
}

// Add row to Google Sheet
async function addToSheet(data) {
  try {
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

    const values = [[
      data.source || '',           // Source
      data.city || '',             // City
      data.state || '',            // State
      data.platform || '',         // Platform
      'Live',                      // Status
      data.link || '',             // Link
      data.notes || '',            // Notes
      data.title || '',            // Title
      timestamp,                   // Added Date
      timestamp,                   // Last Checked (PST)
      timestamp,                   // Last Live (PST)
      data.embedLink || '',        // Embed Link
      data.postedBy || '',         // Posted By
      data.orientation || '',      // Orientation
      data.statusLink || ''        // Status Link
    ]];

    console.log(`Adding to sheet: ${data.link}`);
    console.log(`Values: ${JSON.stringify(values)}`);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.GOOGLE_SHEET_ID,
      range: 'Livestreams!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    logger.info(`Added to sheet: ${data.link}`);
  } catch (error) {
    logger.error(`Error adding to sheet: ${error.message}`);
  }
}

// Process URLs
async function processUrl(url, source, postedBy) {
  try {
    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL
    const validation = validateStreamingUrl(normalizedUrl);
    if (!validation.valid) {
      logger.warn(`Invalid URL rejected: ${normalizedUrl} - ${validation.reason}`);
      return;
    }
    
    const platform = detectPlatform(normalizedUrl);

    logger.info(`Checking URL: ${normalizedUrl} from ${source}`);

    const { isLive, title } = await isLiveStream(normalizedUrl);

    if (isLive) {
      await addToSheet({
        source: source,
        platform: platform,
        link: normalizedUrl,
        title: title,
        postedBy: postedBy,
        notes: `Auto-detected from ${source}`
      });
    } else {
      logger.info(`URL is not live: ${normalizedUrl}`);
    }
  } catch (error) {
    logger.error(`Error processing URL: ${error.message}`);
  }
}

// Discord message handler
discord.on('messageCreate', async (message) => {
  logger.info(`Received Discord message from ${message.author.username}: ${message.content}`);
  if (message.author.bot) return;
  
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
    const urls = extractStreamingUrls(message.content);
    
    // Process URLs concurrently with limit
    await Promise.all(
      urls.map(url => {
        const normalizedUrl = normalizeUrl(url);
        
        // Check if URL is in ignore list
        if (urlIgnoreList.has(normalizedUrl)) {
          logger.info(`Ignoring URL from ignore list: ${normalizedUrl}`);
          return Promise.resolve();
        }
        
        return processLimit(() => processUrl(url, 'Discord', message.author.username));
      })
    );
  }
});

// Twitch message handler
twitch.on('message', async (channel, tags, message, self) => {
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

  const urls = extractStreamingUrls(message);
  
  // Process URLs concurrently with limit
  await Promise.all(
    urls.map(url => {
      const normalizedUrl = normalizeUrl(url);
      
      // Check if URL is in ignore list
      if (urlIgnoreList.has(normalizedUrl)) {
        logger.info(`Ignoring URL from ignore list: ${normalizedUrl}`);
        return Promise.resolve();
      }
      
      return processLimit(() => processUrl(url, 'Twitch', tags.username));
    })
  );
});

// Start the application
async function start() {
  try {
    // Initialize browser pool
    await browserPool.initialize();
    
    // Start rate limiter cleanup
    userRateLimiter.startCleanup();
    
    // Initial fetch of ignore lists
    await fetchIgnoreLists();
    
    // Set up periodic sync of ignore lists
    const ignoreListInterval = setInterval(fetchIgnoreLists, config.IGNORE_LIST_SYNC_INTERVAL);
    logger.info(`Ignore lists will be synced every ${config.IGNORE_LIST_SYNC_INTERVAL / 1000} seconds`);
    
    // Connect Discord
    await discord.login(config.DISCORD_TOKEN);
    logger.info('Discord bot connected');

    // Connect Twitch
    await twitch.connect();
    logger.info('Twitch bot connected');

    logger.info('Application started successfully');
    
    // Store interval for cleanup
    global.ignoreListInterval = ignoreListInterval;
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  
  // Clear intervals
  if (global.ignoreListInterval) {
    clearInterval(global.ignoreListInterval);
  }
  
  // Stop rate limiter cleanup
  userRateLimiter.stopCleanup();
  
  // Disconnect services
  discord.destroy();
  await twitch.disconnect();
  
  // Shutdown browser pool
  await browserPool.shutdown();
  
  process.exit(0);
});

start();