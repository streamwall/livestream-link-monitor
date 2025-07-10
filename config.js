// config.js - Simple configuration for livestream-link-monitor
function validatePositiveInt(value, defaultValue, minValue = 1) {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < minValue) {
    return defaultValue;
  }
  return parsed;
}

module.exports = {
  // Discord Configuration
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
  DISCORD_CONFIRM_REACTION: process.env.DISCORD_CONFIRM_REACTION !== 'false', // Default true

  // Twitch Configuration
  TWITCH_CHANNEL: process.env.TWITCH_CHANNEL || '', // Channel name without #
  TWITCH_CONFIRM_REPLY: process.env.TWITCH_CONFIRM_REPLY !== 'false', // Default true

  // StreamSource API Configuration
  STREAMSOURCE_API_URL: process.env.STREAMSOURCE_API_URL || 'https://api.streamsource.com',
  STREAMSOURCE_EMAIL: process.env.STREAMSOURCE_EMAIL || '',
  STREAMSOURCE_PASSWORD: process.env.STREAMSOURCE_PASSWORD || '',

  // Sync Intervals (in milliseconds)
  IGNORE_LIST_SYNC_INTERVAL: validatePositiveInt(process.env.IGNORE_LIST_SYNC_INTERVAL, 10000, 1000), // 10s
  EXISTING_URLS_SYNC_INTERVAL: validatePositiveInt(process.env.EXISTING_URLS_SYNC_INTERVAL, 60000, 1000), // 60s
  KNOWN_CITIES_SYNC_INTERVAL: validatePositiveInt(process.env.KNOWN_CITIES_SYNC_INTERVAL, 300000, 1000), // 5m

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: validatePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60000, 1000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: validatePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'app.log'
};