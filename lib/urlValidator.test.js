const { validateStreamingUrl, isValidUrl, containsPrivateIP } = require('./urlValidator');

describe('urlValidator', () => {
  describe('validateStreamingUrl', () => {
    it('should validate valid streaming URLs', () => {
      const validUrls = [
        'https://www.twitch.tv/username',
        'https://twitch.tv/username',
        'https://www.youtube.com/watch?v=abc123',
        'https://youtu.be/abc123',
        'https://www.tiktok.com/@username/video/123',
        'https://tiktok.com/@username',
        'https://kick.com/username',
        'https://www.kick.com/username',
        'https://www.facebook.com/gaming/video/123',
        'https://fb.watch/abc123'
      ];

      validUrls.forEach(url => {
        const result = validateStreamingUrl(url);
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
      });
    });

    it('should reject non-streaming URLs', () => {
      const invalidUrls = [
        'https://google.com',
        'https://example.com',
        'https://github.com'
      ];

      invalidUrls.forEach(url => {
        const result = validateStreamingUrl(url);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Not a supported streaming platform');
      });
    });

    it('should reject URLs with private IPs', () => {
      const privateIPs = [
        'http://192.168.1.1',
        'http://10.0.0.1',
        'http://172.16.0.1',
        'http://127.0.0.1',
        'http://localhost'
      ];

      privateIPs.forEach(url => {
        const result = validateStreamingUrl(url);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Private IP addresses not allowed');
      });
    });

    it('should reject non-HTTP(S) protocols', () => {
      const result = validateStreamingUrl('ftp://twitch.tv/username');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid protocol');
    });

    it('should reject invalid URL formats', () => {
      const invalidFormats = [
        'not a url',
        ''
      ];

      invalidFormats.forEach(url => {
        const result = validateStreamingUrl(url);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid URL format');
      });

      // Test javascript protocol separately
      const jsProtocol = validateStreamingUrl('javascript:alert(1)');
      expect(jsProtocol.valid).toBe(false);
      expect(jsProtocol.reason).toBe('Invalid protocol');

      // Test missing protocol separately
      const missingProtocol = validateStreamingUrl('twitch.tv/username');
      expect(missingProtocol.valid).toBe(false);
      expect(missingProtocol.reason).toBe('Invalid URL format');
    });

    it('should handle URL parsing errors gracefully', () => {
      const result = validateStreamingUrl('http://[invalid');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid URL format');
    });

    it('should reject URLs with paths that are too long', () => {
      const longPath = 'a'.repeat(201);
      const result = validateStreamingUrl(`https://twitch.tv/${longPath}`);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('URL path too long');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('www.example.com')).toBe(false);
    });
  });

  describe('containsPrivateIP', () => {
    it('should detect private IP ranges', () => {
      expect(containsPrivateIP('192.168.0.1')).toBe(true);
      expect(containsPrivateIP('192.168.255.255')).toBe(true);
      expect(containsPrivateIP('10.0.0.0')).toBe(true);
      expect(containsPrivateIP('10.255.255.255')).toBe(true);
      expect(containsPrivateIP('172.16.0.0')).toBe(true);
      expect(containsPrivateIP('172.31.255.255')).toBe(true);
    });

    it('should detect localhost and loopback', () => {
      expect(containsPrivateIP('127.0.0.1')).toBe(true);
      expect(containsPrivateIP('127.255.255.255')).toBe(true);
      expect(containsPrivateIP('localhost')).toBe(true);
      expect(containsPrivateIP('LOCALHOST')).toBe(true);
    });

    it('should detect IPv6 localhost', () => {
      expect(containsPrivateIP('::1')).toBe(true);
      expect(containsPrivateIP('0:0:0:0:0:0:0:1')).toBe(true);
    });

    it('should not flag public IPs', () => {
      expect(containsPrivateIP('8.8.8.8')).toBe(false);
      expect(containsPrivateIP('1.1.1.1')).toBe(false);
      expect(containsPrivateIP('93.184.216.34')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(containsPrivateIP('172.15.255.255')).toBe(false); // Just outside private range
      expect(containsPrivateIP('172.32.0.0')).toBe(false); // Just outside private range
      expect(containsPrivateIP('192.167.255.255')).toBe(false); // Not in private range
    });
  });
});
