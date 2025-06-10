// config.js
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

  // Twitch Configuration
  TWITCH_CHANNEL: process.env.TWITCH_CHANNEL || '', // Channel name without #

  // Google Sheets Configuration
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '',
  GOOGLE_CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',

  // Optional Configuration
  IGNORE_LIST_SYNC_INTERVAL: validatePositiveInt(process.env.IGNORE_LIST_SYNC_INTERVAL, 10000, 1000), // Sync ignore lists every 10 seconds by default
  EXISTING_URLS_SYNC_INTERVAL: validatePositiveInt(process.env.EXISTING_URLS_SYNC_INTERVAL, 60000, 1000), // Sync existing URLs every minute by default
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: validatePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60000, 1000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: validatePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
};