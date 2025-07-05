#!/usr/bin/env node

// Test Google Sheets connection
require('dotenv').config();
const { google } = require('googleapis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

async function testGoogleSheets() {
  try {
    logger.info('Testing Google Sheets connection...');
    
    // Check environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID not set in .env');
    }
    
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';
    
    // Initialize auth
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test 1: Get spreadsheet metadata
    logger.info('Fetching spreadsheet metadata...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });
    
    logger.info(`✅ Connected to sheet: "${metadata.data.properties.title}"`);
    logger.info(`   Locale: ${metadata.data.properties.locale}`);
    logger.info(`   Time Zone: ${metadata.data.properties.timeZone}`);
    
    // Test 2: List all tabs
    logger.info('\nAvailable tabs:');
    metadata.data.sheets.forEach(sheet => {
      logger.info(`   - ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows)`);
    });
    
    // Test 3: Try to read from main tab
    const mainTab = process.env.SHEET_TAB_LIVESTREAMS || 'Livesheet';
    logger.info(`\nTesting read from "${mainTab}" tab...`);
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${mainTab}!A1:H1`
      });
      
      if (response.data.values?.[0]) {
        logger.info('✅ Headers found:', response.data.values[0].join(' | '));
      } else {
        logger.info('⚠️  No headers found in first row');
      }
    } catch (error) {
      logger.error(`❌ Could not read from ${mainTab}: ${error.message}`);
    }
    
    // Test 4: Check required tabs
    const requiredTabs = [
      process.env.SHEET_TAB_LIVESTREAMS || 'Livesheet',
      process.env.SHEET_TAB_KNOWN_CITIES || 'Known Cities',
      process.env.SHEET_TAB_TWITCH_IGNORE || 'Twitch User Ignorelist',
      process.env.SHEET_TAB_DISCORD_IGNORE || 'Discord User Ignorelist',
      process.env.SHEET_TAB_URL_IGNORE || 'URL Ignorelist'
    ];
    
    logger.info('\nChecking required tabs:');
    const existingTabs = metadata.data.sheets.map(s => s.properties.title);
    
    requiredTabs.forEach(tab => {
      if (existingTabs.includes(tab)) {
        logger.info(`   ✅ ${tab}`);
      } else {
        logger.error(`   ❌ ${tab} - MISSING!`);
      }
    });
    
    logger.info('\n✅ Google Sheets connection test complete!');
    
  } catch (error) {
    logger.error('\n❌ Google Sheets connection test failed!');
    logger.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ENOENT')) {
      logger.error('   → credentials.json file not found');
      logger.error('   → Download from Google Cloud Console and save as credentials.json');
    } else if (error.message.includes('invalid_grant')) {
      logger.error('   → Invalid credentials or token expired');
      logger.error('   → Re-download credentials from Google Cloud Console');
    } else if (error.message.includes('Permission denied')) {
      logger.error('   → Sheet not shared with service account');
      logger.error('   → Share your sheet with the email in credentials.json');
    }
    
    process.exit(1);
  }
}

// Run the test
testGoogleSheets();