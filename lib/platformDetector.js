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
    
    // Could add other platforms here in the future
    // Twitch: https://www.twitch.tv/username
    // Kick: https://kick.com/username
    
    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  extractStreamingUrls,
  normalizeUrl,
  detectPlatform,
  extractUsername,
  streamingPatterns
};