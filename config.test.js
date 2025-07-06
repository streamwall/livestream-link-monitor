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
    process.env.GOOGLE_SHEET_ID = 'test-sheet';
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('validatePositiveInt', () => {
    it('should return valid positive integers', () => {
      process.env.TEST_VALUE = '100';
      const config = require('./config');
      
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

    it('should load Google Sheets configuration', () => {
      const config = require('./config');
      
      expect(config.GOOGLE_SHEET_ID).toBe('test-sheet');
      expect(config.GOOGLE_CREDENTIALS_PATH).toBe('./credentials.json');
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

  describe('sheet configuration', () => {
    it('should use default sheet tab names', () => {
      const config = require('./config');
      
      expect(config.SHEET_TAB_LIVESTREAMS).toBe('Livesheet');
      expect(config.SHEET_TAB_TWITCH_IGNORE).toBe('Twitch User Ignorelist');
      expect(config.SHEET_TAB_DISCORD_IGNORE).toBe('Discord User Ignorelist');
      expect(config.SHEET_TAB_URL_IGNORE).toBe('URL Ignorelist');
      expect(config.SHEET_TAB_KNOWN_CITIES).toBe('Known Cities');
    });

    it('should use custom sheet tab names when provided', () => {
      process.env.SHEET_TAB_LIVESTREAMS = 'Custom Streams';
      process.env.SHEET_TAB_KNOWN_CITIES = 'Cities Data';
      
      const config = require('./config');
      
      expect(config.SHEET_TAB_LIVESTREAMS).toBe('Custom Streams');
      expect(config.SHEET_TAB_KNOWN_CITIES).toBe('Cities Data');
    });
  });

  describe('column configuration', () => {
    it('should use default column names', () => {
      const config = require('./config');
      
      expect(config.COLUMN_SOURCE).toBe('Source');
      expect(config.COLUMN_PLATFORM).toBe('Platform');
      expect(config.COLUMN_STATUS).toBe('Status');
      expect(config.COLUMN_LINK).toBe('Link');
      expect(config.COLUMN_CITY).toBe('City');
      expect(config.COLUMN_STATE).toBe('State');
    });

    it('should use custom column names when provided', () => {
      process.env.COLUMN_SOURCE = 'Streamer';
      process.env.COLUMN_LINK = 'URL';
      
      const config = require('./config');
      
      expect(config.COLUMN_SOURCE).toBe('Streamer');
      expect(config.COLUMN_LINK).toBe('URL');
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

  describe('backend configuration', () => {
    it('should use default backend settings', () => {
      const config = require('./config');
      
      expect(config.BACKEND_MODE).toBe('single');
      expect(config.BACKEND_PRIMARY).toBe('googleSheets');
      expect(config.BACKEND_GOOGLE_SHEETS_ENABLED).toBe('true');
      expect(config.BACKEND_STREAMSOURCE_ENABLED).toBe('false');
    });

    it('should use custom backend settings', () => {
      process.env.BACKEND_MODE = 'dual-write';
      process.env.BACKEND_PRIMARY = 'streamSource';
      process.env.BACKEND_GOOGLE_SHEETS_ENABLED = 'false';
      process.env.BACKEND_STREAMSOURCE_ENABLED = 'true';
      
      const config = require('./config');
      
      expect(config.BACKEND_MODE).toBe('dual-write');
      expect(config.BACKEND_PRIMARY).toBe('streamSource');
      expect(config.BACKEND_GOOGLE_SHEETS_ENABLED).toBe('false');
      expect(config.BACKEND_STREAMSOURCE_ENABLED).toBe('true');
    });
  });

  describe('StreamSource configuration', () => {
    it('should use default StreamSource settings', () => {
      const config = require('./config');
      
      expect(config.STREAMSOURCE_API_URL).toBe('https://api.streamsource.com');
      expect(config.STREAMSOURCE_EMAIL).toBe('');
      expect(config.STREAMSOURCE_PASSWORD).toBe('');
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

  describe('other configuration', () => {
    it('should use default values', () => {
      const config = require('./config');
      
      expect(config.STATUS_NEW_LINK).toBe('Live');
      expect(config.TIMEZONE).toBe('America/Los_Angeles');
      expect(config.LOG_LEVEL).toBe('info');
      expect(config.LOG_FILE).toBe('app.log');
    });

    it('should use custom values when provided', () => {
      process.env.STATUS_NEW_LINK = 'Active';
      process.env.TIMEZONE = 'America/New_York';
      process.env.LOG_LEVEL = 'debug';
      process.env.LOG_FILE = 'custom.log';
      
      const config = require('./config');
      
      expect(config.STATUS_NEW_LINK).toBe('Active');
      expect(config.TIMEZONE).toBe('America/New_York');
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
        // Twitch
        'TWITCH_CHANNEL',
        // Google Sheets
        'GOOGLE_SHEET_ID',
        'GOOGLE_CREDENTIALS_PATH',
        // Sync intervals
        'IGNORE_LIST_SYNC_INTERVAL',
        'EXISTING_URLS_SYNC_INTERVAL',
        'KNOWN_CITIES_SYNC_INTERVAL',
        // Rate limiting
        'RATE_LIMIT_WINDOW_MS',
        'RATE_LIMIT_MAX_REQUESTS',
        // Sheet tabs
        'SHEET_TAB_LIVESTREAMS',
        'SHEET_TAB_TWITCH_IGNORE',
        'SHEET_TAB_DISCORD_IGNORE',
        'SHEET_TAB_URL_IGNORE',
        'SHEET_TAB_KNOWN_CITIES',
        // Columns
        'COLUMN_SOURCE',
        'COLUMN_PLATFORM',
        'COLUMN_STATUS',
        'COLUMN_LINK',
        'COLUMN_ADDED_DATE',
        'COLUMN_POSTED_BY',
        'COLUMN_CITY',
        'COLUMN_STATE',
        // Other
        'STATUS_NEW_LINK',
        'TIMEZONE',
        'LOG_LEVEL',
        'LOG_FILE',
        'DISCORD_CONFIRM_REACTION',
        'TWITCH_CONFIRM_REPLY',
        // Backend
        'BACKEND_MODE',
        'BACKEND_PRIMARY',
        'BACKEND_GOOGLE_SHEETS_ENABLED',
        'BACKEND_STREAMSOURCE_ENABLED',
        'STREAMSOURCE_API_URL',
        'STREAMSOURCE_EMAIL',
        'STREAMSOURCE_PASSWORD'
      ];
      
      expectedKeys.forEach(key => {
        expect(config).toHaveProperty(key);
      });
      
      expect(Object.keys(config).length).toBe(expectedKeys.length);
    });
  });
});