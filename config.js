// config.js
module.exports = {
  // Discord Configuration
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',

  // Twitch Configuration
  TWITCH_CHANNEL: process.env.TWITCH_CHANNEL || '', // Channel name without #

  // Google Sheets Configuration
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '',

  // Optional Configuration
  CHECK_INTERVAL: parseInt(process.env.CHECK_INTERVAL) || 60000, // Re-check interval in ms
  MAX_CONCURRENT_CHECKS: parseInt(process.env.MAX_CONCURRENT_CHECKS) || 3
};