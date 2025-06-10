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
  KNOWN_CITIES_SYNC_INTERVAL: validatePositiveInt(process.env.KNOWN_CITIES_SYNC_INTERVAL, 300000, 1000), // Sync known cities every 5 minutes by default

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: validatePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60000, 1000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: validatePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10),

  // Sheet configuration
  SHEET_TAB_LIVESTREAMS: process.env.SHEET_TAB_LIVESTREAMS || 'Livesheet',
  SHEET_TAB_TWITCH_IGNORE: process.env.SHEET_TAB_TWITCH_IGNORE || 'Twitch User Ignorelist',
  SHEET_TAB_DISCORD_IGNORE: process.env.SHEET_TAB_DISCORD_IGNORE || 'Discord User Ignorelist',
  SHEET_TAB_URL_IGNORE: process.env.SHEET_TAB_URL_IGNORE || 'URL Ignorelist',
  SHEET_TAB_KNOWN_CITIES: process.env.SHEET_TAB_KNOWN_CITIES || 'Known Cities',

  // Column names (for dynamic mapping)
  COLUMN_SOURCE: process.env.COLUMN_SOURCE || 'Source',
  COLUMN_PLATFORM: process.env.COLUMN_PLATFORM || 'Platform',
  COLUMN_STATUS: process.env.COLUMN_STATUS || 'Status',
  COLUMN_LINK: process.env.COLUMN_LINK || 'Link',
  COLUMN_ADDED_DATE: process.env.COLUMN_ADDED_DATE || 'Added Date',
  COLUMN_POSTED_BY: process.env.COLUMN_POSTED_BY || 'Posted By',
  COLUMN_CITY: process.env.COLUMN_CITY || 'City',
  COLUMN_STATE: process.env.COLUMN_STATE || 'State',

  // Status values
  STATUS_NEW_LINK: process.env.STATUS_NEW_LINK || 'Live',

  // Time configuration
  TIMEZONE: process.env.TIMEZONE || 'America/Los_Angeles',

  // Log configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'app.log',

  // Confirmation settings
  DISCORD_CONFIRM_REACTION: process.env.DISCORD_CONFIRM_REACTION !== 'false', // Default true
  TWITCH_CONFIRM_REPLY: process.env.TWITCH_CONFIRM_REPLY !== 'false' // Default true
};