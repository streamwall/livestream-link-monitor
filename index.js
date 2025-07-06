// index.js
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const winston = require('winston');
const config = require('./config');
const RateLimiter = require('./lib/rateLimiter');
const { validateStreamingUrl } = require('./lib/urlValidator');
const { extractStreamingUrls, normalizeUrl, resolveTikTokUrl, detectPlatform, extractUsername } = require('./lib/platformDetector');
const { parseLocation } = require('./lib/locationParser');
const BackendManager = require('./lib/backends/BackendManager');

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

// Backend setup
let backendManager = null;

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

// Ignore lists (will be populated from backend)
const ignoreLists = {
  twitchUsers: new Set(),
  discordUsers: new Set(),
  urls: new Set()
};

// Known cities cache update interval
let knownCitiesInterval = null;

// Rate limiters
const userRateLimiter = new RateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  maxRequests: config.RATE_LIMIT_MAX_REQUESTS
});

// Fetch ignore lists from backend
async function fetchIgnoreLists() {
  logger.info('Fetching ignore lists from backend');

  try {
    const lists = await backendManager.getIgnoreLists();

    ignoreLists.twitchUsers = lists.ignoredUsers.twitch || new Set();
    ignoreLists.discordUsers = lists.ignoredUsers.discord || new Set();
    ignoreLists.urls = lists.ignoredUrls || new Set();

    logger.info(`Loaded ${ignoreLists.twitchUsers.size} Twitch users to ignore list`);
    logger.info(`Loaded ${ignoreLists.discordUsers.size} Discord users to ignore list`);
    logger.info(`Loaded ${ignoreLists.urls.size} URLs to ignore list`);
  } catch (error) {
    logger.error(`Failed to fetch ignore lists: ${error.message}`);
  }
}

// Fetch known cities from backend
async function fetchKnownCities() {
  try {
    logger.info('Fetching known cities from backend');

    // The backend will handle loading cities into the location parser cache
    await backendManager.sync('cities');

    logger.info('Known cities synced from backend');
  } catch (error) {
    logger.error(`Failed to fetch known cities: ${error.message}`);
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

    // Check if URL already exists
    if (await backendManager.urlExists(normalizedUrl)) {
      logger.info(`URL already exists: ${normalizedUrl}`);
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

    await backendManager.addStream({
      url: normalizedUrl,
      platform,
      postedBy,
      source: username || postedBy, // Will use postedBy if username not extractable
      city,
      state,
      notes: `Added from ${source} by ${postedBy}`
    });

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
    if (ignoreLists.discordUsers.has(message.author.username.toLowerCase())) {
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
        if (ignoreLists.urls.has(normalizedUrl)) {
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
    if (self) { return; }

    // Check if user is in ignore list
    if (ignoreLists.twitchUsers.has(tags.username.toLowerCase())) {
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
      if (ignoreLists.urls.has(normalizedUrl)) {
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
    // Initialize backend manager
    backendManager = new BackendManager(config, logger);
    await backendManager.initialize();

    // Start rate limiter cleanup
    userRateLimiter.startCleanup();

    // Fetch initial data
    await Promise.all([
      fetchIgnoreLists(),
      fetchKnownCities()
    ]);

    // Set up periodic sync
    const ignoreListInterval = setInterval(fetchIgnoreLists, config.IGNORE_LIST_SYNC_INTERVAL);
    const existingUrlsInterval = setInterval(async () => {
      await backendManager.sync('urls');
    }, config.EXISTING_URLS_SYNC_INTERVAL || 60000);
    knownCitiesInterval = setInterval(fetchKnownCities, config.KNOWN_CITIES_SYNC_INTERVAL);
    logger.info(`Ignore lists will be synced every ${config.IGNORE_LIST_SYNC_INTERVAL / 1000} seconds`);
    logger.info(`Existing URLs will be synced every ${(config.EXISTING_URLS_SYNC_INTERVAL || 60000) / 1000} seconds`);
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

    // Shutdown backend manager
    if (backendManager) {
      await backendManager.shutdown();
    }

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
