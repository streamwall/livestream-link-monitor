// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const { google } = require('googleapis');
const { chromium } = require('playwright');
const winston = require('winston');
const config = require('./config');

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
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Discord client setup
const discord = new Client({
  intents: [
    GatewayIntentBits.MessageContent
  ]
});

// Twitch client setup
const twitch = new tmi.Client({
  channels: [config.TWITCH_CHANNEL]
});

// URL patterns for streaming platforms
const streamingPatterns = [
  /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?kick\.com\/\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:watch|live)\S+/gi,
  /(?:https?:\/\/)?(?:www\.)?fb\.watch\/\S+/gi
];

// Extract URLs from message
function extractStreamingUrls(message) {
  const urls = [];
  for (const pattern of streamingPatterns) {
    const matches = message.match(pattern) || [];
    urls.push(...matches);
  }
  return [...new Set(urls)]; // Remove duplicates
}

// Normalize URL
function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

// Detect platform from URL
function detectPlatform(url) {
  if (url.includes('twitch.tv')) return 'Twitch';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('kick.com')) return 'Kick';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
  return 'Unknown';
}

// Check if URL is a live stream using Playwright
async function isLiveStream(url) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();
    logger.info(`Checking URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const platform = detectPlatform(url);
    let isLive = false;
    let title = '';

    logger.info(`Detected platform: ${platform}`);

    switch (platform) {
      case 'Twitch':
        isLive = await page.locator('[data-a-target="stream-indicator"]').count() > 0 ||
                 await page.locator('.live-indicator').count() > 0;
        title = await page.locator('h1').first().textContent().catch(() => '');
        break;

      case 'YouTube':
        isLive = await page.locator('.ytp-live-badge').count() > 0 ||
                 await page.locator('[aria-label*="LIVE"]').count() > 0;
        title = await page.locator('h1.ytd-video-primary-info-renderer').textContent().catch(() => '');
        break;

      case 'TikTok':
        delay(3000); // Wait for TikTok to load
        const html = await page.content();
        const viewerIconVisible = await page.locator('svg[aria-label*="viewer"] ~ span').first().isVisible();
        isLive = viewerIconVisible || html.includes('"isLiveBroadcast":true')
        title = await page.locator('h2[data-e2e="user-profile-uid"]').textContent().catch(() => '');
        break;

      case 'Kick':
        isLive = await page.locator('.stream-status-live').count() > 0;
        title = await page.locator('.stream-title').textContent().catch(() => '');
        break;

      case 'Facebook':
        isLive = await page.locator('[aria-label*="LIVE"]').count() > 0 ||
                 await page.locator('.live-indicator').count() > 0;
        title = await page.locator('h2').first().textContent().catch(() => '');
        break;
    }

    logger.info(`Is live: ${isLive}, Title: ${title}`);

    await browser.close();
    return { isLive, title: title.trim() };

  } catch (error) {
    logger.error(`Error checking if live: ${error.message}`);
    if (browser) await browser.close();
    return { isLive: false, title: '' };
  }
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

    // await sheets.spreadsheets.values.append({
    //   spreadsheetId: config.GOOGLE_SHEET_ID,
    //   range: 'Livestreams!A:O',
    //   valueInputOption: 'USER_ENTERED',
    //   requestBody: { values }
    // });

    logger.info(`Added to sheet: ${data.link}`);
  } catch (error) {
    logger.error(`Error adding to sheet: ${error.message}`);
  }
}

// Process URLs
async function processUrl(url, source, postedBy) {
  try {
    const normalizedUrl = normalizeUrl(url);
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

  if (message.channelId === config.DISCORD_CHANNEL_ID) {
    const urls = extractStreamingUrls(message.content);
    for (const url of urls) {
      await processUrl(url, 'Discord', message.author.username);
    }
  }
});

// Twitch message handler
twitch.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const urls = extractStreamingUrls(message);
  for (const url of urls) {
    await processUrl(url, 'Twitch', tags.username);
  }
});

// Start the application
async function start() {
  try {
    // Connect Discord
    await discord.login(config.DISCORD_TOKEN);
    logger.info('Discord bot connected');

    // Connect Twitch
    await twitch.connect();
    logger.info('Twitch bot connected');

    logger.info('Application started successfully');
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  discord.destroy();
  await twitch.disconnect();
  process.exit(0);
});

start();