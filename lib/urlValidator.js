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
  'fb.watch',
  'instagram.com',
  'www.instagram.com'
];

function containsPrivateIP(url) {
  const privateIPPatterns = [
    /^192\.168\.\d{1,3}\.\d{1,3}$/,
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    /^localhost$/i,
    /^::1$/,
    /^0:0:0:0:0:0:0:1$/
  ];

  return privateIPPatterns.some(pattern => pattern.test(url));
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateStreamingUrl(url) {
  try {
    const parsed = new URL(url);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return { valid: false, reason: 'Invalid protocol' };
    }

    // Check for private IPs
    if (containsPrivateIP(parsed.hostname)) {
      return { valid: false, reason: 'Private IP addresses not allowed' };
    }

    // Check domain
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      return { valid: false, reason: 'Not a supported streaming platform' };
    }

    // Check path length (prevent DoS)
    if (parsed.pathname.length > 200) {
      return { valid: false, reason: 'URL path too long' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

module.exports = { validateStreamingUrl, isValidUrl, containsPrivateIP };
