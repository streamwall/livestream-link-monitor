// index.js - Main entry point for livestream-link-monitor
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const winston = require('winston');
const config = require('./config');
const RateLimiter = require('./lib/rateLimiter');
const { validateStreamingUrl } = require('./lib/urlValidator');
const { extractStreamingUrls, normalizeUrl, resolveTikTokUrl, detectPlatform, extractUsername } = require('./lib/platformDetector');
const { parseLocation } = require('./lib/locationParser');
const StreamSourceClient = require('./lib/streamSourceClient');

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

// StreamSource client
let streamSource = null;

// Discord client
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Twitch client
const twitch = new tmi.Client({
  channels: [config.TWITCH_CHANNEL]
});

// Ignore lists (populated from StreamSource)
const ignoreLists = {
  twitchUsers: new Set(),
  discordUsers: new Set(),
  urls: new Set(),
  domains: new Set()
};

// Rate limiter
const rateLimiter = new RateLimiter(config.RATE_LIMIT_WINDOW_MS, config.RATE_LIMIT_MAX_REQUESTS);

// Sync intervals
let ignoreListInterval = null;
let existingUrlsInterval = null;
let knownCitiesInterval = null;

// Helper functions
async function fetchIgnoreLists() {
  logger.info('Fetching ignore lists from StreamSource');
  
  try {
    const lists = await streamSource.getIgnoreLists();
    
    ignoreLists.twitchUsers = lists.ignoredUsers.twitch || new Set();
    ignoreLists.discordUsers = lists.ignoredUsers.discord || new Set();
    ignoreLists.urls = lists.ignoredUrls || new Set();
    ignoreLists.domains = lists.ignoredDomains || new Set();
    
    logger.info(`Loaded ignore lists - Twitch: ${ignoreLists.twitchUsers.size}, Discord: ${ignoreLists.discordUsers.size}, URLs: ${ignoreLists.urls.size}, Domains: ${ignoreLists.domains.size}`);
  } catch (error) {
    logger.error(`Failed to fetch ignore lists: ${error.message}`);
  }
}

async function fetchKnownCities() {
  logger.info('Syncing known cities from StreamSource');
  
  try {
    await streamSource.syncKnownCities();
    logger.info('Known cities synced from StreamSource');
  } catch (error) {
    logger.error(`Failed to sync known cities: ${error.message}`);
  }
}

async function processStreamUrl(url, source, messageContent, postedBy) {
  try {
    // Validate URL security
    if (!validateStreamingUrl(url)) {
      logger.warn(`Invalid/insecure URL blocked: ${url}`);
      return { success: false, reason: 'invalid' };
    }

    // Normalize the URL
    let normalizedUrl = normalizeUrl(url);

    // Resolve TikTok redirects if needed
    if (normalizedUrl.includes('tiktok.com')) {
      try {
        normalizedUrl = await resolveTikTokUrl(normalizedUrl);
      } catch (error) {
        logger.error(`Failed to resolve TikTok URL: ${error.message}`);
      }
    }

    // Check if URL is in ignore list
    if (ignoreLists.urls.has(normalizedUrl)) {
      logger.info(`URL in ignore list: ${normalizedUrl}`);
      return { success: false, reason: 'ignored' };
    }

    // Check if domain is ignored
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace(/^www\./, '');
    if (ignoreLists.domains.has(domain)) {
      logger.info(`Domain in ignore list: ${domain}`);
      return { success: false, reason: 'ignored' };
    }

    // Check if URL already exists
    if (await streamSource.urlExists(normalizedUrl)) {
      logger.info(`URL already exists: ${normalizedUrl}`);
      return { success: false, reason: 'duplicate' };
    }

    // Detect platform
    const platform = detectPlatform(normalizedUrl);
    if (!platform) {
      logger.warn(`Unknown platform for URL: ${normalizedUrl}`);
      return { success: false, reason: 'unknown_platform' };
    }

    // Parse location from message
    const location = parseLocation(messageContent);

    // Extract username if possible
    const username = extractUsername(normalizedUrl, platform);

    logger.info(`Adding new URL: ${normalizedUrl} from ${source}`);

    await streamSource.addStream({
      url: normalizedUrl,
      platform,
      source,
      postedBy,
      username,
      city: location?.city || '',
      state: location?.state || '',
      notes: `Platform: ${platform}${username ? `, Username: ${username}` : ''}`
    });

    return { success: true };
  } catch (error) {
    logger.error(`Error processing URL ${url}: ${error.message}`);
    return { success: false, reason: 'error' };
  }
}

// Discord event handlers
discord.on('ready', () => {
  logger.info(`Discord bot logged in as ${discord.user.tag}`);
});

discord.on('messageCreate', async (message) => {
  // Skip bot messages
  if (message.author.bot) return;

  // Only process messages from configured channel
  if (message.channel.id !== config.DISCORD_CHANNEL_ID) return;

  // Check ignore list
  if (ignoreLists.discordUsers.has(message.author.username.toLowerCase())) {
    logger.debug(`Ignoring message from Discord user: ${message.author.username}`);
    return;
  }

  // Check rate limit
  if (!rateLimiter.checkRateLimit(message.author.id)) {
    logger.warn(`Rate limit exceeded for Discord user: ${message.author.username}`);
    if (config.DISCORD_CONFIRM_REACTION) {
      await message.react('⏱️').catch(() => {});
    }
    return;
  }

  // Extract URLs from message
  const urls = extractStreamingUrls(message.content);
  if (urls.length === 0) return;

  logger.info(`Found ${urls.length} URL(s) in Discord message from ${message.author.username}`);

  // Process each URL
  for (const url of urls) {
    const result = await processStreamUrl(url, 'Discord', message.content, message.author.username);
    
    // Add reaction based on result
    if (config.DISCORD_CONFIRM_REACTION) {
      if (result.success) {
        await message.react('✅').catch(() => {});
      } else if (result.reason === 'duplicate') {
        await message.react('🔁').catch(() => {});
      } else {
        await message.react('❌').catch(() => {});
      }
    }
  }
});

// Twitch event handlers
twitch.on('connected', () => {
  logger.info('Connected to Twitch chat');
});

twitch.on('message', async (channel, tags, message, self) => {
  // Skip bot messages
  if (self) return;

  const username = tags.username?.toLowerCase();

  // Check ignore list
  if (ignoreLists.twitchUsers.has(username)) {
    logger.debug(`Ignoring message from Twitch user: ${username}`);
    return;
  }

  // Check rate limit
  if (!rateLimiter.checkRateLimit(username)) {
    logger.warn(`Rate limit exceeded for Twitch user: ${username}`);
    return;
  }

  // Extract URLs from message
  const urls = extractStreamingUrls(message);
  if (urls.length === 0) return;

  logger.info(`Found ${urls.length} URL(s) in Twitch message from ${username}`);

  // Process each URL
  let successCount = 0;
  for (const url of urls) {
    const result = await processStreamUrl(url, 'Twitch', message, username);
    if (result.success) successCount++;
  }

  // Send confirmation message
  if (config.TWITCH_CONFIRM_REPLY && successCount > 0) {
    twitch.say(channel, `@${username} Added ${successCount} stream(s) to the list!`).catch(() => {});
  }
});

// Error handlers
discord.on('error', error => {
  logger.error(`Discord error: ${error.message}`);
});

twitch.on('disconnected', (reason) => {
  logger.warn(`Disconnected from Twitch: ${reason}`);
});

// Main startup function
async function main() {
  try {
    // Initialize StreamSource client
    streamSource = new StreamSourceClient(config, logger);
    await streamSource.initialize();

    // Start rate limiter cleanup
    rateLimiter.startCleanup();

    // Initial data fetch
    await fetchIgnoreLists();
    await fetchKnownCities();

    // Set up sync intervals
    ignoreListInterval = setInterval(fetchIgnoreLists, config.IGNORE_LIST_SYNC_INTERVAL);
    existingUrlsInterval = setInterval(() => streamSource.syncExistingUrls(), config.EXISTING_URLS_SYNC_INTERVAL);
    knownCitiesInterval = setInterval(fetchKnownCities, config.KNOWN_CITIES_SYNC_INTERVAL);

    // Connect to Discord
    if (config.DISCORD_TOKEN && config.DISCORD_CHANNEL_ID) {
      await discord.login(config.DISCORD_TOKEN);
    } else {
      logger.warn('Discord configuration missing, skipping Discord connection');
    }

    // Connect to Twitch
    if (config.TWITCH_CHANNEL) {
      await twitch.connect();
    } else {
      logger.warn('Twitch configuration missing, skipping Twitch connection');
    }

    logger.info('Livestream Link Monitor started successfully');
  } catch (error) {
    logger.error(`Failed to start: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');

  // Clear intervals
  if (ignoreListInterval) clearInterval(ignoreListInterval);
  if (existingUrlsInterval) clearInterval(existingUrlsInterval);
  if (knownCitiesInterval) clearInterval(knownCitiesInterval);

  // Stop rate limiter
  rateLimiter.stopCleanup();

  // Disconnect from services
  try {
    discord.destroy();
    await twitch.disconnect();
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
  }

  logger.info('Shutdown complete');
  process.exit(0);
}

// Signal handlers
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the application
main();