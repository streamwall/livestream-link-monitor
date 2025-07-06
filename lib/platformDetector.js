// URL patterns for streaming platforms
const streamingPatterns = [
  /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?kick\.com\/[^\s\n\r"'<>{}[\]]+/gi,
  // eslint-disable-next-line max-len
  /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:watch|live|share\/v\/|[^\/\s]+\/videos\/)[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?fb\.watch\/[^\s\n\r"'<>{}[\]]+/gi,
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\/\s]+\/live(?:\/[^\s\n\r"'<>{}[\]]+)?/gi
];

// Extract URLs from message
function extractStreamingUrls(message) {
  if (!message) { return []; }

  const urls = [];
  for (const pattern of streamingPatterns) {
    const matches = message.match(pattern) || [];
    urls.push(...matches);
  }
  return [...new Set(urls)]; // Remove duplicates
}

// Normalize URL
function normalizeUrl(url) {
  if (!url) { return 'https://'; }

  url = url.trim();

  if (url === '://') { return url; } // Don't modify malformed protocols

  // If it already has a protocol, keep it
  if (url.includes('://')) {
    return url;
  }

  // Otherwise add https
  url = `https://${url}`;

  // Only remove query parameters from TikTok URLs
  try {
    const urlObj = new URL(url);

    // For TikTok, strip query parameters and fragments
    if (urlObj.hostname.includes('tiktok.com')) {
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    }

    // For all other platforms, keep the URL as-is
    return url;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

// Resolve TikTok redirect URLs to their final destination
async function resolveTikTokUrl(url) {
  try {
    // Only process TikTok /t/ redirect URLs
    if (!url.includes('tiktok.com/t/')) {
      return normalizeUrl(url);
    }

    // Use fetch to follow redirects
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    });

    return normalizeUrl(response.url);
  } catch {
    return normalizeUrl(url);
  }
}

// Detect platform from URL
function detectPlatform(url) {
  if (url.includes('twitch.tv')) { return 'Twitch'; }
  if (url.includes('tiktok.com')) { return 'TikTok'; }
  if (url.includes('youtube.com') || url.includes('youtu.be')) { return 'YouTube'; }
  if (url.includes('kick.com')) { return 'Kick'; }
  if (url.includes('facebook.com') || url.includes('fb.watch')) { return 'Facebook'; }
  if (url.includes('instagram.com')) { return 'Instagram'; }
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

    // YouTube: https://youtube.com/@username, /c/username, /user/username
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      // Handle @username format
      const atMatch = urlObj.pathname.match(/^\/@([^\/]+)/);
      if (atMatch && atMatch[1]) {
        return atMatch[1];
      }

      // Handle /c/username format
      const cMatch = urlObj.pathname.match(/^\/c\/([^\/]+)/);
      if (cMatch && cMatch[1]) {
        return cMatch[1];
      }

      // Handle /user/username format
      const userMatch = urlObj.pathname.match(/^\/user\/([^\/]+)/);
      if (userMatch && userMatch[1]) {
        return userMatch[1];
      }

      return null;
    }

    // Facebook: https://facebook.com/username, https://facebook.com/gaming/username
    if (urlObj.hostname.includes('facebook.com')) {
      // Handle /gaming/username format
      const gamingMatch = urlObj.pathname.match(/^\/gaming\/([^\/]+)/);
      if (gamingMatch && gamingMatch[1]) {
        return gamingMatch[1];
      }

      // Handle /username format
      const match = urlObj.pathname.match(/^\/([^\/]+)/);
      if (match && match[1]) {
        // Exclude common non-username paths
        const username = match[1];
        if (!['watch', 'search', 'pages', 'groups', 'events', 'marketplace', 'gaming'].includes(username)) {
          return username;
        }
      }
      return null;
    }

    return null;
  } catch {
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
