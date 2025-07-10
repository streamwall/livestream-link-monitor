const { Client, Events, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const winston = require('winston');

// Mock all dependencies
jest.mock('discord.js');
jest.mock('tmi.js');
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    printf: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));
jest.mock('./config', () => ({
  DISCORD_TOKEN: 'test-discord-token',
  DISCORD_CHANNEL_ID: 'test-channel-id',
  TWITCH_CHANNEL: 'test-twitch-channel',
  STREAMSOURCE_API_URL: 'http://test-api.com',
  STREAMSOURCE_EMAIL: 'test@example.com',
  STREAMSOURCE_PASSWORD: 'test-password',
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 3,
  DISCORD_CONFIRM_REACTION: true,
  TWITCH_CONFIRM_REPLY: true,
  IGNORE_LIST_SYNC_INTERVAL: 10000,
  EXISTING_URLS_SYNC_INTERVAL: 60000,
  KNOWN_CITIES_SYNC_INTERVAL: 300000,
  LOG_LEVEL: 'info',
  LOG_FILE: 'test.log'
}));
jest.mock('./lib/streamSourceClient');
jest.mock('./lib/rateLimiter');
jest.mock('./lib/platformDetector');
jest.mock('./lib/urlValidator');
jest.mock('./lib/locationParser');

// Import modules for easier access
const StreamSourceClient = require('./lib/streamSourceClient');
const rateLimiterModule = require('./lib/rateLimiter');
const platformDetectorModule = require('./lib/platformDetector');
const urlValidatorModule = require('./lib/urlValidator');
const locationParserModule = require('./lib/locationParser');

describe('index.js', () => {
  let mockDiscordClient;
  let mockTwitchClient;
  let mockStreamSourceClient;
  let mockRateLimiter;
  let mockLogger;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Setup logger mock
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
    winston.createLogger.mockReturnValue(mockLogger);

    // Setup Discord client mock
    mockDiscordClient = {
      on: jest.fn(),
      login: jest.fn().mockResolvedValue(),
      destroy: jest.fn(),
      user: { tag: 'TestBot#1234' }
    };
    Client.mockReturnValue(mockDiscordClient);

    // Setup Twitch client mock
    mockTwitchClient = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(),
      disconnect: jest.fn().mockResolvedValue(),
      say: jest.fn().mockResolvedValue()
    };
    tmi.Client.mockReturnValue(mockTwitchClient);

    // Setup StreamSource client mock
    mockStreamSourceClient = {
      initialize: jest.fn().mockResolvedValue(),
      addStream: jest.fn().mockResolvedValue({ success: true, id: 123 }),
      urlExists: jest.fn().mockResolvedValue(false),
      getIgnoreLists: jest.fn().mockResolvedValue({
        ignoredUsers: { twitch: new Set(), discord: new Set() },
        ignoredUrls: new Set(),
        ignoredDomains: new Set()
      }),
      syncKnownCities: jest.fn().mockResolvedValue(),
      syncExistingUrls: jest.fn().mockResolvedValue()
    };
    StreamSourceClient.mockReturnValue(mockStreamSourceClient);

    // Setup rate limiter mock
    mockRateLimiter = {
      checkRateLimit: jest.fn().mockReturnValue(true),
      startCleanup: jest.fn(),
      stopCleanup: jest.fn()
    };
    rateLimiterModule.mockReturnValue(mockRateLimiter);

    // Setup other mocks
    urlValidatorModule.validateStreamingUrl = jest.fn().mockReturnValue(true);
    platformDetectorModule.extractStreamingUrls = jest.fn().mockReturnValue(['https://twitch.tv/test']);
    platformDetectorModule.normalizeUrl = jest.fn(url => url);
    platformDetectorModule.resolveTikTokUrl = jest.fn(url => Promise.resolve(url));
    platformDetectorModule.detectPlatform = jest.fn().mockReturnValue('twitch');
    platformDetectorModule.extractUsername = jest.fn().mockReturnValue('testuser');
    locationParserModule.parseLocation = jest.fn().mockReturnValue({ city: 'New York', state: 'NY' });
  });

  afterEach(() => {
    // Clear all timers
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize StreamSource client and connect to services', async () => {
      require('./index');

      // Wait for initialization
      await new Promise(resolve => setImmediate(resolve));

      expect(StreamSourceClient).toHaveBeenCalledWith(expect.any(Object), mockLogger);
      expect(mockStreamSourceClient.initialize).toHaveBeenCalled();
      expect(mockDiscordClient.login).toHaveBeenCalledWith('test-discord-token');
      expect(mockTwitchClient.connect).toHaveBeenCalled();
    });

    it('should start sync intervals', async () => {
      jest.useFakeTimers();
      require('./index');

      await new Promise(resolve => setImmediate(resolve));

      expect(setInterval).toHaveBeenCalledTimes(3);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 10000); // Ignore list sync
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000); // URL sync
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 300000); // Cities sync

      jest.useRealTimers();
    });
  });

  describe('Discord message handling', () => {
    let messageHandler;

    beforeEach(async () => {
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Get the messageCreate handler
      const calls = mockDiscordClient.on.mock.calls;
      const messageCreateCall = calls.find(call => call[0] === 'messageCreate');
      messageHandler = messageCreateCall[1];
    });

    it('should process valid stream URLs from Discord', async () => {
      const mockMessage = {
        author: { bot: false, id: '123', username: 'testuser' },
        channel: { id: 'test-channel-id' },
        content: 'Check out this stream: https://twitch.tv/test',
        react: jest.fn()
      };

      await messageHandler(mockMessage);

      expect(mockStreamSourceClient.urlExists).toHaveBeenCalledWith('https://twitch.tv/test');
      expect(mockStreamSourceClient.addStream).toHaveBeenCalledWith({
        url: 'https://twitch.tv/test',
        platform: 'twitch',
        source: 'Discord',
        postedBy: 'testuser',
        username: 'testuser',
        city: 'New York',
        state: 'NY',
        notes: 'Platform: twitch, Username: testuser'
      });
      expect(mockMessage.react).toHaveBeenCalledWith('✅');
    });

    it('should ignore bot messages', async () => {
      const mockMessage = {
        author: { bot: true, id: '123', username: 'bot' },
        channel: { id: 'test-channel-id' },
        content: 'https://twitch.tv/test'
      };

      await messageHandler(mockMessage);

      expect(mockStreamSourceClient.addStream).not.toHaveBeenCalled();
    });

    it('should handle duplicate URLs', async () => {
      mockStreamSourceClient.urlExists.mockResolvedValueOnce(true);

      const mockMessage = {
        author: { bot: false, id: '123', username: 'testuser' },
        channel: { id: 'test-channel-id' },
        content: 'https://twitch.tv/test',
        react: jest.fn()
      };

      await messageHandler(mockMessage);

      expect(mockStreamSourceClient.addStream).not.toHaveBeenCalled();
      expect(mockMessage.react).toHaveBeenCalledWith('🔁');
    });
  });

  describe('Twitch message handling', () => {
    let messageHandler;

    beforeEach(async () => {
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Get the message handler
      const calls = mockTwitchClient.on.mock.calls;
      const messageCall = calls.find(call => call[0] === 'message');
      messageHandler = messageCall[1];
    });

    it('should process valid stream URLs from Twitch', async () => {
      await messageHandler(
        '#test-channel',
        { username: 'testuser' },
        'Check out https://twitch.tv/test',
        false
      );

      expect(mockStreamSourceClient.addStream).toHaveBeenCalledWith({
        url: 'https://twitch.tv/test',
        platform: 'twitch',
        source: 'Twitch',
        postedBy: 'testuser',
        username: 'testuser',
        city: 'New York',
        state: 'NY',
        notes: 'Platform: twitch, Username: testuser'
      });
      expect(mockTwitchClient.say).toHaveBeenCalledWith('#test-channel', '@testuser Added 1 stream(s) to the list!');
    });

    it('should ignore self messages', async () => {
      await messageHandler(
        '#test-channel',
        { username: 'bot' },
        'https://twitch.tv/test',
        true // self = true
      );

      expect(mockStreamSourceClient.addStream).not.toHaveBeenCalled();
    });
  });

  describe('graceful shutdown', () => {
    it('should cleanup on SIGTERM', async () => {
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Trigger SIGTERM
      process.emit('SIGTERM');

      // Give it time to cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRateLimiter.stopCleanup).toHaveBeenCalled();
      expect(mockDiscordClient.destroy).toHaveBeenCalled();
      expect(mockTwitchClient.disconnect).toHaveBeenCalled();
    });
  });
});