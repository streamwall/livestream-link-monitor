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

module.exports = {
  extractStreamingUrls,
  normalizeUrl,
  detectPlatform,
  streamingPatterns
};