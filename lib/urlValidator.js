const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const ALLOWED_DOMAINS = [
  'twitch.tv',
  'www.twitch.tv',
  'tiktok.com',
  'www.tiktok.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'kick.com',
  'www.kick.com',
  'facebook.com',
  'www.facebook.com',
  'fb.watch'
];

function validateStreamingUrl(url) {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return { valid: false, reason: 'Invalid protocol' };
    }
    
    // Check domain
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      return { valid: false, reason: 'Invalid domain' };
    }
    
    // Check for localhost/internal IPs
    if (parsed.hostname === 'localhost' || 
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.startsWith('192.168.') ||
        parsed.hostname.startsWith('10.') ||
        parsed.hostname.startsWith('172.')) {
      return { valid: false, reason: 'Internal URL not allowed' };
    }
    
    // Check path length (prevent DoS)
    if (parsed.pathname.length > 200) {
      return { valid: false, reason: 'URL path too long' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

module.exports = { validateStreamingUrl };