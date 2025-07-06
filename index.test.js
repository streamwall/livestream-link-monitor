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
  BACKEND_MODE: 'single',
  BACKEND_PRIMARY: 'googleSheets',
  BACKEND_GOOGLE_SHEETS_ENABLED: 'true',
  BACKEND_STREAMSOURCE_ENABLED: 'false',
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 3,
  DISCORD_CONFIRM_REACTION: true,
  TWITCH_CONFIRM_REPLY: true
}));
jest.mock('./lib/backends/BackendManager');
jest.mock('./lib/rateLimiter');
jest.mock('./lib/platformDetector');
jest.mock('./lib/urlValidator');
jest.mock('./lib/locationParser');

// Import modules for easier access
const BackendManager = require('./lib/backends/BackendManager');
const rateLimiterModule = require('./lib/rateLimiter');
const platformDetectorModule = require('./lib/platformDetector');
const urlValidatorModule = require('./lib/urlValidator');
const locationParserModule = require('./lib/locationParser');

describe('index.js', () => {
  let mockDiscordClient;
  let mockTwitchClient;
  let mockBackendManager;
  let mockLogger;
  let mockRateLimiter;
  
  // Store original process methods
  const originalExit = process.exit;
  const originalOn = process.on;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
    winston.createLogger.mockReturnValue(mockLogger);

    // Mock rate limiter
    mockRateLimiter = {
      check: jest.fn().mockReturnValue(true),
      cleanup: jest.fn()
    };
    rateLimiterModule.createRateLimiter.mockReturnValue(mockRateLimiter);

    // Mock Discord client
    mockDiscordClient = {
      login: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      once: jest.fn(),
      channels: {
        cache: {
          get: jest.fn()
        }
      }
    };
    Client.mockReturnValue(mockDiscordClient);

    // Mock Twitch client
    mockTwitchClient = {
      connect: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      say: jest.fn().mockResolvedValue()
    };
    tmi.Client.mockReturnValue(mockTwitchClient);

    // Mock Backend Manager
    mockBackendManager = {
      initialize: jest.fn().mockResolvedValue(),
      urlExists: jest.fn().mockResolvedValue(false),
      addStream: jest.fn().mockResolvedValue({ success: true }),
      getIgnoreLists: jest.fn().mockResolvedValue({
        ignoredUsers: {
          twitch: new Set(),
          discord: new Set()
        },
        ignoredUrls: new Set()
      }),
      getKnownCities: jest.fn().mockResolvedValue(new Map()),
      sync: jest.fn().mockResolvedValue(),
      shutdown: jest.fn().mockResolvedValue()
    };
    BackendManager.mockReturnValue(mockBackendManager);

    // Mock process methods
    process.exit = jest.fn();
    process.on = jest.fn();
  });

  afterEach(() => {
    // Restore process methods
    process.exit = originalExit;
    process.on = originalOn;
  });

  describe('initialization', () => {
    it('should initialize all components on startup', async () => {
      // Import the main file (this runs the code)
      require('./index');

      // Wait for async initialization
      await new Promise(resolve => setImmediate(resolve));

      expect(winston.createLogger).toHaveBeenCalled();
      expect(BackendManager).toHaveBeenCalled();
      expect(mockBackendManager.initialize).toHaveBeenCalled();
      expect(Client).toHaveBeenCalledWith({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      });
      expect(tmi.Client).toHaveBeenCalledWith({
        channels: ['test-twitch-channel']
      });
    });
  });

  describe('Discord message handling', () => {
    let messageHandler;
    let mockMessage;
    let mockChannel;

    beforeEach(async () => {
      // Capture the message handler
      mockDiscordClient.on.mockImplementation((event, handler) => {
        if (event === Events.MessageCreate) {
          messageHandler = handler;
        }
      });

      // Import to register handlers
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Setup mock message
      mockChannel = {
        id: 'test-channel-id'
      };
      
      mockMessage = {
        author: {
          bot: false,
          id: 'user123',
          username: 'testuser'
        },
        channel: mockChannel,
        content: 'Check out my stream at https://twitch.tv/teststreamer',
        react: jest.fn().mockResolvedValue()
      };

      // Setup detector mocks
      platformDetectorModule.extractStreamingUrls.mockReturnValue(['https://twitch.tv/teststreamer']);
      urlValidatorModule.isValidUrl.mockReturnValue(true);
      platformDetectorModule.detectPlatform.mockReturnValue('Twitch');
      platformDetectorModule.extractUsername.mockReturnValue('teststreamer');
      locationParserModule.parseLocation.mockReturnValue({ city: 'New York', state: 'NY' });
    });

    it('should process valid Discord messages with streaming URLs', async () => {
      await messageHandler(mockMessage);

      expect(platformDetectorModule.extractStreamingUrls).toHaveBeenCalledWith(mockMessage.content);
      expect(mockBackendManager.urlExists).toHaveBeenCalledWith('https://twitch.tv/teststreamer');
      expect(mockBackendManager.addStream).toHaveBeenCalledWith({
        url: 'https://twitch.tv/teststreamer',
        source: 'Discord',
        platform: 'Twitch',
        postedBy: 'testuser',
        city: 'New York',
        state: 'NY'
      });
      expect(mockMessage.react).toHaveBeenCalledWith('✅');
    });

    it('should ignore bot messages', async () => {
      mockMessage.author.bot = true;
      
      await messageHandler(mockMessage);

      expect(platformDetectorModule.extractStreamingUrls).not.toHaveBeenCalled();
    });

    it('should ignore messages from wrong channel', async () => {
      mockMessage.channel.id = 'wrong-channel';
      
      await messageHandler(mockMessage);

      expect(platformDetectorModule.extractStreamingUrls).not.toHaveBeenCalled();
    });

    it('should ignore messages from ignored users', async () => {
      mockBackendManager.getIgnoreLists.mockResolvedValueOnce({
        ignoredUsers: {
          discord: new Set(['testuser']),
          twitch: new Set()
        },
        ignoredUrls: new Set()
      });

      await messageHandler(mockMessage);

      expect(mockBackendManager.addStream).not.toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      mockRateLimiter.check.mockReturnValue(false);
      
      await messageHandler(mockMessage);

      expect(mockBackendManager.addStream).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited Discord user')
      );
    });

    it('should skip duplicate URLs', async () => {
      mockBackendManager.urlExists.mockResolvedValueOnce(true);
      
      await messageHandler(mockMessage);

      expect(mockBackendManager.addStream).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      );
    });

    it('should handle invalid URLs', async () => {
      urlValidatorModule.isValidUrl.mockReturnValue(false);
      
      await messageHandler(mockMessage);

      expect(mockBackendManager.addStream).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid URL detected')
      );
    });

    it('should handle backend errors gracefully', async () => {
      mockBackendManager.addStream.mockRejectedValueOnce(new Error('Backend error'));
      
      await messageHandler(mockMessage);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error processing Discord message:',
        expect.any(Error)
      );
    });
  });

  describe('Twitch message handling', () => {
    let messageHandler;

    beforeEach(async () => {
      // Capture the message handler
      mockTwitchClient.on.mockImplementation((event, handler) => {
        if (event === 'message') {
          messageHandler = handler;
        }
      });

      // Import to register handlers
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Setup detector mocks
      platformDetectorModule.extractStreamingUrls.mockReturnValue(['https://youtube.com/watch?v=abc123']);
      urlValidatorModule.isValidUrl.mockReturnValue(true);
      platformDetectorModule.detectPlatform.mockReturnValue('YouTube');
      locationParserModule.parseLocation.mockReturnValue(null);
    });

    it('should process valid Twitch messages with streaming URLs', async () => {
      const tags = { username: 'twitchuser' };
      const message = 'Watch my YouTube video: https://youtube.com/watch?v=abc123';

      await messageHandler('test-twitch-channel', tags, message, false);

      expect(platformDetectorModule.extractStreamingUrls).toHaveBeenCalledWith(message);
      expect(mockBackendManager.addStream).toHaveBeenCalledWith({
        url: 'https://youtube.com/watch?v=abc123',
        source: 'Twitch',
        platform: 'YouTube',
        postedBy: 'twitchuser',
        city: '',
        state: ''
      });
      expect(mockTwitchClient.say).toHaveBeenCalledWith(
        'test-twitch-channel',
        '@twitchuser URL added! ✅'
      );
    });

    it('should ignore self messages', async () => {
      await messageHandler('test-twitch-channel', {}, 'message', true);

      expect(platformDetectorModule.extractStreamingUrls).not.toHaveBeenCalled();
    });

    it('should handle missing username', async () => {
      await messageHandler('test-twitch-channel', {}, 'https://twitch.tv/stream', false);

      expect(platformDetectorModule.extractStreamingUrls).toHaveBeenCalled();
      expect(mockBackendManager.addStream).toHaveBeenCalledWith(
        expect.objectContaining({
          postedBy: 'unknown'
        })
      );
    });

    it('should handle ignored Twitch users', async () => {
      mockBackendManager.getIgnoreLists.mockResolvedValueOnce({
        ignoredUsers: {
          twitch: new Set(['twitchuser']),
          discord: new Set()
        },
        ignoredUrls: new Set()
      });

      await messageHandler('test-twitch-channel', { username: 'twitchuser' }, 'message', false);

      expect(mockBackendManager.addStream).not.toHaveBeenCalled();
    });
  });

  describe('processUrls', () => {
    // Since processUrls is called by the message handlers, it's tested above
    // but we can test error scenarios more directly by mocking internal functions
    
    it('should handle multiple URLs in one message', async () => {
      const mockMessage = {
        author: { bot: false, username: 'user' },
        channel: { id: 'test-channel-id' },
        content: 'https://twitch.tv/stream1 and https://youtube.com/watch?v=123',
        react: jest.fn()
      };

      platformDetectorModule.extractStreamingUrls.mockReturnValue([
        'https://twitch.tv/stream1',
        'https://youtube.com/watch?v=123'
      ]);
      urlValidatorModule.isValidUrl.mockReturnValue(true);
      platformDetectorModule.detectPlatform.mockImplementation(url => 
        url.includes('twitch') ? 'Twitch' : 'YouTube'
      );

      // Get message handler
      let messageHandler;
      mockDiscordClient.on.mockImplementation((event, handler) => {
        if (event === Events.MessageCreate) {
          messageHandler = handler;
        }
      });
      
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      await messageHandler(mockMessage);

      expect(mockBackendManager.addStream).toHaveBeenCalledTimes(2);
    });
  });

  describe('sync intervals', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set up sync intervals', async () => {
      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Fast forward time to trigger syncs
      jest.advanceTimersByTime(10000); // IGNORE_LIST_SYNC_INTERVAL
      expect(mockBackendManager.sync).toHaveBeenCalledWith('ignoreLists');

      jest.advanceTimersByTime(60000); // EXISTING_URLS_SYNC_INTERVAL
      expect(mockBackendManager.sync).toHaveBeenCalledWith('urls');

      jest.advanceTimersByTime(300000); // KNOWN_CITIES_SYNC_INTERVAL
      expect(mockBackendManager.sync).toHaveBeenCalledWith('cities');
    });
  });

  describe('shutdown handling', () => {
    it('should handle graceful shutdown', async () => {
      let shutdownHandler;
      process.on.mockImplementation((signal, handler) => {
        if (signal === 'SIGINT') {
          shutdownHandler = handler;
        }
      });

      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      // Trigger shutdown
      await shutdownHandler();

      expect(mockBackendManager.shutdown).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Shutting down gracefully...');
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle uncaught exceptions', async () => {
      let exceptionHandler;
      process.on.mockImplementation((event, handler) => {
        if (event === 'uncaughtException') {
          exceptionHandler = handler;
        }
      });

      require('./index');
      await new Promise(resolve => setImmediate(resolve));

      const error = new Error('Test error');
      exceptionHandler(error);

      expect(mockLogger.error).toHaveBeenCalledWith('Uncaught Exception:', error);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});