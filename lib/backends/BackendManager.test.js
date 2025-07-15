const BackendManager = require('./BackendManager');
const StreamSourceBackend = require('./StreamSourceBackend');

// Mock the backend implementation
jest.mock('./StreamSourceBackend');

describe('BackendManager', () => {
  let manager;
  let mockLogger;
  let mockConfig;
  let mockStreamBackend;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockConfig = {
      STREAMSOURCE_API_URL: 'http://localhost:3000',
      STREAMSOURCE_EMAIL: 'test@example.com',
      STREAMSOURCE_PASSWORD: 'password'
    };

    // Mock backend instance
    mockStreamBackend = {
      initialize: jest.fn().mockResolvedValue(),
      addStream: jest.fn().mockResolvedValue({ success: true }),
      urlExists: jest.fn().mockResolvedValue(false),
      getExistingUrls: jest.fn().mockResolvedValue(new Set()),
      getIgnoreLists: jest.fn().mockResolvedValue({
        ignoredUsers: { twitch: new Set(), discord: new Set() },
        ignoredUrls: new Set(),
        ignoredDomains: new Set()
      }),
      getKnownCities: jest.fn().mockResolvedValue(new Map()),
      sync: jest.fn().mockResolvedValue(),
      shutdown: jest.fn().mockResolvedValue()
    };

    StreamSourceBackend.mockImplementation(() => mockStreamBackend);

    manager = new BackendManager(mockConfig, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with provided config and logger', () => {
      expect(manager.config).toBe(mockConfig);
      expect(manager.logger).toBe(mockLogger);
      expect(manager.backend).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should initialize StreamSource backend', async () => {
      await manager.initialize();

      expect(StreamSourceBackend).toHaveBeenCalledWith(mockConfig, mockLogger);
      expect(mockStreamBackend.initialize).toHaveBeenCalled();
      expect(manager.backend).toBe(mockStreamBackend);
      expect(mockLogger.info).toHaveBeenCalledWith('Initializing BackendManager with StreamSource');
      expect(mockLogger.info).toHaveBeenCalledWith('StreamSource backend initialized');
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      mockStreamBackend.initialize.mockRejectedValueOnce(error);

      await expect(manager.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('addStream', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should add stream via backend', async () => {
      const streamData = { url: 'https://twitch.tv/test' };
      const result = await manager.addStream(streamData);

      expect(mockStreamBackend.addStream).toHaveBeenCalledWith(streamData);
      expect(result).toEqual({ success: true });
    });

    it('should handle add stream errors', async () => {
      const streamData = { url: 'https://twitch.tv/test' };
      const error = new Error('API Error');
      mockStreamBackend.addStream.mockRejectedValueOnce(error);

      await expect(manager.addStream(streamData)).rejects.toThrow('API Error');
    });
  });

  describe('urlExists', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should check if URL exists via backend', async () => {
      mockStreamBackend.urlExists.mockResolvedValueOnce(true);

      const exists = await manager.urlExists('https://twitch.tv/test');

      expect(mockStreamBackend.urlExists).toHaveBeenCalledWith('https://twitch.tv/test');
      expect(exists).toBe(true);
    });

    it('should handle errors when checking URL existence', async () => {
      const error = new Error('API Error');
      mockStreamBackend.urlExists.mockRejectedValueOnce(error);

      await expect(manager.urlExists('https://twitch.tv/test')).rejects.toThrow('API Error');
    });
  });

  describe('getExistingUrls', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should get existing URLs from backend', async () => {
      const urls = new Set(['url1', 'url2']);
      mockStreamBackend.getExistingUrls.mockResolvedValueOnce(urls);

      const result = await manager.getExistingUrls();

      expect(mockStreamBackend.getExistingUrls).toHaveBeenCalled();
      expect(result).toBe(urls);
    });
  });

  describe('getIgnoreLists', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should get ignore lists from backend', async () => {
      const ignoreLists = {
        ignoredUsers: { twitch: new Set(['user1']), discord: new Set(['user2']) },
        ignoredUrls: new Set(['url1']),
        ignoredDomains: new Set(['domain1'])
      };
      mockStreamBackend.getIgnoreLists.mockResolvedValueOnce(ignoreLists);

      const result = await manager.getIgnoreLists();

      expect(mockStreamBackend.getIgnoreLists).toHaveBeenCalled();
      expect(result).toEqual(ignoreLists);
    });
  });

  describe('getKnownCities', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should get known cities from backend', async () => {
      const cities = new Map([
        ['New York City', { state: 'NY', aliases: ['NYC'] }],
        ['Los Angeles', { state: 'CA', aliases: ['LA'] }]
      ]);
      mockStreamBackend.getKnownCities.mockResolvedValueOnce(cities);

      const result = await manager.getKnownCities();

      expect(mockStreamBackend.getKnownCities).toHaveBeenCalled();
      expect(result).toBe(cities);
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should sync data via backend', async () => {
      await manager.sync('urls');

      expect(mockStreamBackend.sync).toHaveBeenCalledWith('urls');
    });

    it('should handle sync errors', async () => {
      const error = new Error('Sync failed');
      mockStreamBackend.sync.mockRejectedValueOnce(error);

      await expect(manager.sync('urls')).rejects.toThrow('Sync failed');
    });
  });

  describe('shutdown', () => {
    it('should not error if backend not initialized', async () => {
      await expect(manager.shutdown()).resolves.not.toThrow();
    });

    it('should shutdown backend if initialized', async () => {
      await manager.initialize();
      await manager.shutdown();

      expect(mockStreamBackend.shutdown).toHaveBeenCalled();
    });

    it('should handle backend without shutdown method', async () => {
      await manager.initialize();
      delete mockStreamBackend.shutdown;

      await expect(manager.shutdown()).resolves.not.toThrow();
    });

    it('should handle shutdown errors', async () => {
      await manager.initialize();
      const error = new Error('Shutdown failed');
      mockStreamBackend.shutdown.mockRejectedValueOnce(error);

      await expect(manager.shutdown()).rejects.toThrow('Shutdown failed');
    });
  });
});