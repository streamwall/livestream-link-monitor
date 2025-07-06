const {
  extractStreamingUrls,
  normalizeUrl,
  resolveTikTokUrl,
  detectPlatform,
  extractUsername,
  streamingPatterns
} = require('./platformDetector');

// Mock fetch for TikTok redirect tests
global.fetch = jest.fn();

describe('platformDetector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractStreamingUrls', () => {
    it('should extract valid streaming URLs from text', () => {
      const text = `
        Check out my stream at https://twitch.tv/username
        Also on https://www.youtube.com/watch?v=abc123
        And https://tiktok.com/@user/video/123
      `;

      const urls = extractStreamingUrls(text);
      expect(urls).toHaveLength(3);
      expect(urls).toContain('https://twitch.tv/username');
      expect(urls).toContain('https://www.youtube.com/watch?v=abc123');
      expect(urls).toContain('https://tiktok.com/@user/video/123');
    });

    it('should handle URLs without protocol', () => {
      const text = 'Watch me on twitch.tv/mystream';
      const urls = extractStreamingUrls(text);
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('twitch.tv/mystream');
    });

    it('should extract multiple URLs from same platform', () => {
      const text = 'https://twitch.tv/user1 and https://twitch.tv/user2';
      const urls = extractStreamingUrls(text);
      expect(urls).toHaveLength(2);
    });

    it('should handle empty text', () => {
      expect(extractStreamingUrls('')).toEqual([]);
      expect(extractStreamingUrls(null)).toEqual([]);
      expect(extractStreamingUrls(undefined)).toEqual([]);
    });

    it('should extract all supported platforms', () => {
      const platforms = [
        'https://twitch.tv/user',
        'https://youtube.com/watch?v=123',
        'https://youtu.be/123',
        'https://tiktok.com/@user',
        'https://kick.com/user',
        'https://fb.watch/abc'
      ];

      const text = platforms.join(' ');
      const urls = extractStreamingUrls(text);
      expect(urls).toHaveLength(platforms.length);
    });
  });

  describe('normalizeUrl', () => {
    it('should add https protocol if missing', () => {
      expect(normalizeUrl('twitch.tv/user')).toBe('https://twitch.tv/user');
      expect(normalizeUrl('www.youtube.com/watch?v=123')).toBe('https://www.youtube.com/watch?v=123');
    });

    it('should not modify URLs with protocol', () => {
      expect(normalizeUrl('https://twitch.tv/user')).toBe('https://twitch.tv/user');
      expect(normalizeUrl('http://youtube.com/watch')).toBe('http://youtube.com/watch');
    });

    it('should handle edge cases', () => {
      expect(normalizeUrl('')).toBe('https://');
      expect(normalizeUrl('://')).toBe('://');
      expect(normalizeUrl('ftp://example.com')).toBe('ftp://example.com');
    });

    it('should trim whitespace', () => {
      expect(normalizeUrl('  twitch.tv/user  ')).toBe('https://twitch.tv/user');
    });

    it('should strip query parameters from TikTok URLs', () => {
      // This will test the TikTok-specific logic in normalizeUrl
      expect(normalizeUrl('tiktok.com/@user/video/123?foo=bar#hash'))
        .toBe('https://tiktok.com/@user/video/123');
    });

    it('should handle URL parsing errors', () => {
      // This should trigger the catch block in normalizeUrl
      expect(normalizeUrl('https://[invalid-url')).toBe('https://[invalid-url');

      // Test with a malformed URL that would cause new URL() to throw
      expect(normalizeUrl('http://192.168.1.256:99999999')).toBe('http://192.168.1.256:99999999');
    });
  });

  describe('resolveTikTokUrl', () => {
    beforeEach(() => {
      // Spy on console methods to test logger
      jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      console.log.mockRestore();
      console.error.mockRestore();
    });

    it('should resolve TikTok redirect URLs', async () => {
      const redirectUrl = 'https://www.tiktok.com/@user/video/123456';
      fetch.mockResolvedValueOnce({
        url: redirectUrl
      });

      const result = await resolveTikTokUrl('https://www.tiktok.com/t/ABC123');
      expect(result).toBe(redirectUrl);
      expect(fetch).toHaveBeenCalledWith('https://www.tiktok.com/t/ABC123', {
        method: 'HEAD',
        redirect: 'follow'
      });
    });

    it('should return original URL on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const originalUrl = 'https://www.tiktok.com/t/ABC123';
      const result = await resolveTikTokUrl(originalUrl);
      expect(result).toBe(originalUrl);
    });

    it('should handle non-redirect URLs', async () => {
      const url = 'https://tiktok.com/@user/video/123';
      const result = await resolveTikTokUrl(url);
      expect(result).toBe(url);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('detectPlatform', () => {
    it('should detect Twitch', () => {
      expect(detectPlatform('https://twitch.tv/user')).toBe('Twitch');
      expect(detectPlatform('https://www.twitch.tv/user')).toBe('Twitch');
    });

    it('should detect YouTube', () => {
      expect(detectPlatform('https://youtube.com/watch?v=123')).toBe('YouTube');
      expect(detectPlatform('https://youtu.be/123')).toBe('YouTube');
      expect(detectPlatform('https://m.youtube.com/watch?v=123')).toBe('YouTube');
    });

    it('should detect TikTok', () => {
      expect(detectPlatform('https://tiktok.com/@user')).toBe('TikTok');
      expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('TikTok');
    });

    it('should detect Kick', () => {
      expect(detectPlatform('https://kick.com/user')).toBe('Kick');
      expect(detectPlatform('https://www.kick.com/user')).toBe('Kick');
    });

    it('should detect Facebook', () => {
      expect(detectPlatform('https://facebook.com/gaming/video/123')).toBe('Facebook');
      expect(detectPlatform('https://fb.watch/abc')).toBe('Facebook');
    });

    it('should return Unknown for unsupported platforms', () => {
      expect(detectPlatform('https://example.com')).toBe('Unknown');
      expect(detectPlatform('https://google.com')).toBe('Unknown');
    });
  });

  describe('extractUsername', () => {
    it('should extract Twitch usernames', () => {
      expect(extractUsername('https://twitch.tv/shroud')).toBe('shroud');
      expect(extractUsername('https://www.twitch.tv/ninja')).toBe('ninja');
      expect(extractUsername('https://twitch.tv/pokimane/clip/ABC')).toBe('pokimane');
    });

    it('should extract TikTok usernames', () => {
      expect(extractUsername('https://tiktok.com/@charlidamelio')).toBe('charlidamelio');
      expect(extractUsername('https://www.tiktok.com/@khaby.lame/video/123')).toBe('khaby.lame');
    });

    it('should handle TikTok URLs without usernames', () => {
      expect(extractUsername('https://tiktok.com/')).toBeNull();
      expect(extractUsername('https://tiktok.com/trending')).toBeNull();
      expect(extractUsername('https://tiktok.com/@')).toBeNull(); // Empty username
    });

    it('should extract Kick usernames', () => {
      expect(extractUsername('https://kick.com/xqc')).toBe('xqc');
      expect(extractUsername('https://www.kick.com/trainwreck/clips')).toBe('trainwreck');
    });

    it('should handle YouTube URLs', () => {
      expect(extractUsername('https://youtube.com/watch?v=123')).toBeNull();
      expect(extractUsername('https://youtube.com/@MrBeast')).toBe('MrBeast');
      expect(extractUsername('https://youtube.com/c/PewDiePie')).toBe('PewDiePie');
      expect(extractUsername('https://youtube.com/user/NinjasHyper')).toBe('NinjasHyper');
    });

    it('should handle Facebook URLs', () => {
      expect(extractUsername('https://facebook.com/zuck')).toBe('zuck');
      expect(extractUsername('https://facebook.com/gaming/Meta')).toBe('Meta');
      expect(extractUsername('https://fb.watch/abc123')).toBeNull();
    });

    it('should handle Facebook URLs with excluded paths', () => {
      expect(extractUsername('https://facebook.com/watch')).toBeNull();
      expect(extractUsername('https://facebook.com/marketplace')).toBeNull();
      expect(extractUsername('https://facebook.com/groups')).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      expect(extractUsername('not a url')).toBeNull();
      expect(extractUsername('https://example.com')).toBeNull();
      expect(extractUsername('')).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(extractUsername('https://twitch.tv/')).toBeNull();
      expect(extractUsername('https://tiktok.com/@')).toBeNull();
      expect(extractUsername('https://kick.com/user?query=param')).toBe('user');
    });
  });

  describe('streamingPatterns', () => {
    it('should export streaming patterns array', () => {
      expect(streamingPatterns).toBeDefined();
      expect(Array.isArray(streamingPatterns)).toBe(true);
      expect(streamingPatterns.length).toBeGreaterThan(0);
    });

    it('should have patterns that work with test URLs', () => {
      const testUrls = [
        'https://twitch.tv/test',
        'https://tiktok.com/@test',
        'https://youtube.com/watch?v=test'
      ];

      testUrls.forEach(url => {
        const matched = streamingPatterns.some(pattern => pattern.test(url));
        expect(matched).toBe(true);
      });
    });
  });
});
