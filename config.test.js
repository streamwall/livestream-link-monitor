describe('config', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Clear module cache to get fresh config
    jest.resetModules();

    // Set required env vars
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CHANNEL_ID = 'test-channel';
    process.env.TWITCH_CHANNEL = 'test-twitch';
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('validatePositiveInt', () => {
    it('should return valid positive integers', () => {
      process.env.TEST_VALUE = '100';

      // Access the validation function through a test value
      process.env.RATE_LIMIT_WINDOW_MS = '5000';
      jest.resetModules();
      const newConfig = require('./config');

      expect(newConfig.RATE_LIMIT_WINDOW_MS).toBe(5000);
    });

    it('should return default for invalid values', () => {
      process.env.RATE_LIMIT_WINDOW_MS = 'invalid';
      const config = require('./config');

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(60000); // default
    });

    it('should return default for negative values', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '-1000';
      const config = require('./config');

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(60000); // default
    });

    it('should enforce minimum value', () => {
      process.env.IGNORE_LIST_SYNC_INTERVAL = '500'; // below minimum of 1000
      const config = require('./config');

      expect(config.IGNORE_LIST_SYNC_INTERVAL).toBe(10000); // default
    });
  });

  describe('required configuration', () => {
    it('should load Discord configuration', () => {
      const config = require('./config');

      expect(config.DISCORD_TOKEN).toBe('test-token');
      expect(config.DISCORD_CHANNEL_ID).toBe('test-channel');
    });

    it('should load Twitch configuration', () => {
      const config = require('./config');

      expect(config.TWITCH_CHANNEL).toBe('test-twitch');
    });

    it('should handle missing required values with empty strings', () => {
      delete process.env.DISCORD_TOKEN;
      const config = require('./config');

      expect(config.DISCORD_TOKEN).toBe('');
    });
  });

  describe('optional configuration with defaults', () => {
    it('should use default sync intervals', () => {
      const config = require('./config');

      expect(config.IGNORE_LIST_SYNC_INTERVAL).toBe(10000);
      expect(config.EXISTING_URLS_SYNC_INTERVAL).toBe(60000);
      expect(config.KNOWN_CITIES_SYNC_INTERVAL).toBe(300000);
    });

    it('should use custom sync intervals when provided', () => {
      process.env.IGNORE_LIST_SYNC_INTERVAL = '30000';
      process.env.EXISTING_URLS_SYNC_INTERVAL = '120000';
      process.env.KNOWN_CITIES_SYNC_INTERVAL = '600000';

      const config = require('./config');

      expect(config.IGNORE_LIST_SYNC_INTERVAL).toBe(30000);
      expect(config.EXISTING_URLS_SYNC_INTERVAL).toBe(120000);
      expect(config.KNOWN_CITIES_SYNC_INTERVAL).toBe(600000);
    });
  });

  describe('boolean configuration', () => {
    it('should default confirmation settings to true', () => {
      const config = require('./config');

      expect(config.DISCORD_CONFIRM_REACTION).toBe(true);
      expect(config.TWITCH_CONFIRM_REPLY).toBe(true);
    });

    it('should handle false string for boolean settings', () => {
      process.env.DISCORD_CONFIRM_REACTION = 'false';
      process.env.TWITCH_CONFIRM_REPLY = 'false';

      const config = require('./config');

      expect(config.DISCORD_CONFIRM_REACTION).toBe(false);
      expect(config.TWITCH_CONFIRM_REPLY).toBe(false);
    });

    it('should treat any non-false value as true', () => {
      process.env.DISCORD_CONFIRM_REACTION = '0';
      process.env.TWITCH_CONFIRM_REPLY = 'no';

      const config = require('./config');

      expect(config.DISCORD_CONFIRM_REACTION).toBe(true);
      expect(config.TWITCH_CONFIRM_REPLY).toBe(true);
    });
  });

  describe('StreamSource configuration', () => {
    it('should use default StreamSource settings', () => {
      const config = require('./config');

      expect(config.STREAMSOURCE_API_URL).toBe('http://localhost:3000');
      expect(config.STREAMSOURCE_EMAIL).toBe('test@example.com');
      expect(config.STREAMSOURCE_PASSWORD).toBe('test-password');
    });

    it('should use custom StreamSource settings', () => {
      process.env.STREAMSOURCE_API_URL = 'https://custom.api.com';
      process.env.STREAMSOURCE_EMAIL = 'test@example.com';
      process.env.STREAMSOURCE_PASSWORD = 'secret123';

      const config = require('./config');

      expect(config.STREAMSOURCE_API_URL).toBe('https://custom.api.com');
      expect(config.STREAMSOURCE_EMAIL).toBe('test@example.com');
      expect(config.STREAMSOURCE_PASSWORD).toBe('secret123');
    });
  });

  describe('rate limiting configuration', () => {
    it('should use default rate limiting values', () => {
      const config = require('./config');

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(60000);
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(10);
    });

    it('should use custom rate limiting values', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '30000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '5';

      const config = require('./config');

      expect(config.RATE_LIMIT_WINDOW_MS).toBe(30000);
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(5);
    });
  });

  describe('logging configuration', () => {
    it('should use default logging values', () => {
      const config = require('./config');

      expect(config.LOG_LEVEL).toBe('error');
      expect(config.LOG_FILE).toBe('app.log');
    });

    it('should use custom logging values when provided', () => {
      process.env.LOG_LEVEL = 'debug';
      process.env.LOG_FILE = 'custom.log';

      const config = require('./config');

      expect(config.LOG_LEVEL).toBe('debug');
      expect(config.LOG_FILE).toBe('custom.log');
    });
  });

  describe('all configuration keys', () => {
    it('should export all expected configuration keys', () => {
      const config = require('./config');
      const expectedKeys = [
        // Discord
        'DISCORD_TOKEN',
        'DISCORD_CHANNEL_ID',
        'DISCORD_CONFIRM_REACTION',
        // Twitch
        'TWITCH_CHANNEL',
        'TWITCH_CONFIRM_REPLY',
        // StreamSource
        'STREAMSOURCE_API_URL',
        'STREAMSOURCE_EMAIL',
        'STREAMSOURCE_PASSWORD',
        // Sync intervals
        'IGNORE_LIST_SYNC_INTERVAL',
        'EXISTING_URLS_SYNC_INTERVAL',
        'KNOWN_CITIES_SYNC_INTERVAL',
        // Rate limiting
        'RATE_LIMIT_WINDOW_MS',
        'RATE_LIMIT_MAX_REQUESTS',
        // Logging
        'LOG_LEVEL',
        'LOG_FILE'
      ];

      expectedKeys.forEach(key => {
        expect(config).toHaveProperty(key);
      });

      expect(Object.keys(config).length).toBe(expectedKeys.length);
    });
  });
});