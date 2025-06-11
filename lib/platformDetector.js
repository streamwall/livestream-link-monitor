// Simple logger fallback
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

// URL patterns for streaming platforms
const streamingPatterns = [
  /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?kick\.com\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:watch|live)[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?fb\.watch\/[^\s\n\r"'<>{}[\]]+/gi
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

// Resolve TikTok redirect URLs to their final destination
async function resolveTikTokUrl(url) {
  try {
    // Only process TikTok /t/ redirect URLs
    if (!url.includes('tiktok.com/t/')) {
      return url;
    }

    const https = require('https');

    return new Promise((resolve) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.10 Safari/605.1.1'
        },
        timeout: 5000
      }, (response) => {
        // TikTok returns 301/302 with Location header
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            // Extract the clean URL without query parameters
            const cleanUrl = redirectUrl.split('?')[0];
            logger.info(`TikTok redirect resolved: ${url} -> ${cleanUrl}`);
            resolve(cleanUrl);
            return;
          }
        }
        // If no redirect, return original URL
        resolve(url);
      }).on('error', (err) => {
        // On error, return original URL
        logger.error(`Failed to resolve TikTok URL ${url}: ${err.message}`);
        resolve(url);
      }).on('timeout', () => {
        // On timeout, return original URL
        logger.error(`Timeout resolving TikTok URL ${url}`);
        resolve(url);
      });
    });
  } catch (error) {
    // On any error, return original URL
    return url;
  }
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

// Extract username from platform URLs
function extractUsername(url) {
  try {
    const urlObj = new URL(url);

    // TikTok: https://www.tiktok.com/@username/live
    if (urlObj.hostname.includes('tiktok.com')) {
      // Only extract if it starts with @ (actual username)
      const match = urlObj.pathname.match(/^\/@([^\/]+)/);
      if (match && match[1]) {
        return match[1]; // Return username without @ symbol
      }
      // Don't extract from redirect URLs like /t/xxxxx
      return null;
    }

    // Twitch: https://www.twitch.tv/username
    if (urlObj.hostname.includes('twitch.tv')) {
      const match = urlObj.pathname.match(/^\/([^\/]+)/);
      if (match && match[1]) {
        // Exclude common non-username paths
        const username = match[1];
        if (!['directory', 'search', 'videos', 'settings', 'subscriptions'].includes(username)) {
          return username;
        }
      }
      return null;
    }

    // Kick: https://kick.com/username
    if (urlObj.hostname.includes('kick.com')) {
      const match = urlObj.pathname.match(/^\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  extractStreamingUrls,
  normalizeUrl,
  resolveTikTokUrl,
  detectPlatform,
  extractUsername,
  streamingPatterns
};