const BackendManager = require('./BackendManager');
const GoogleSheetsBackend = require('./GoogleSheetsBackend');
const StreamSourceBackend = require('./StreamSourceBackend');

// Mock the backend implementations
jest.mock('./GoogleSheetsBackend');
jest.mock('./StreamSourceBackend');

describe('BackendManager', () => {
  let manager;
  let mockLogger;
  let mockConfig;
  let mockGoogleBackend;
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
      BACKEND_MODE: 'single',
      BACKEND_PRIMARY: 'googleSheets',
      BACKEND_GOOGLE_SHEETS_ENABLED: 'true',
      BACKEND_STREAMSOURCE_ENABLED: 'false'
    };

    // Mock backend instances
    mockGoogleBackend = {
      initialize: jest.fn().mockResolvedValue(),
      addStream: jest.fn().mockResolvedValue({ success: true }),
      urlExists: jest.fn().mockResolvedValue(false),
      getExistingUrls: jest.fn().mockResolvedValue(new Set()),
      getIgnoreLists: jest.fn().mockResolvedValue({
        ignoredUsers: { twitch: new Set(), discord: new Set() },
        ignoredUrls: new Set()
      }),
      getKnownCities: jest.fn().mockResolvedValue(new Map()),
      sync: jest.fn().mockResolvedValue(),
      shutdown: jest.fn().mockResolvedValue()
    };

    mockStreamBackend = {
      initialize: jest.fn().mockResolvedValue(),
      addStream: jest.fn().mockResolvedValue({ success: true }),
      urlExists: jest.fn().mockResolvedValue(false),
      getExistingUrls: jest.fn().mockResolvedValue(new Set()),
      getIgnoreLists: jest.fn().mockResolvedValue({
        ignoredUsers: { twitch: new Set(), discord: new Set() },
        ignoredUrls: new Set()
      }),
      getKnownCities: jest.fn().mockResolvedValue(new Map()),
      sync: jest.fn().mockResolvedValue(),
      shutdown: jest.fn().mockResolvedValue()
    };

    GoogleSheetsBackend.mockImplementation(() => mockGoogleBackend);
    StreamSourceBackend.mockImplementation(() => mockStreamBackend);

    manager = new BackendManager(mockConfig, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(manager.mode).toBe('single');
      expect(manager.backendsConfig.googleSheets).toBe(true);
      expect(manager.backendsConfig.streamSource).toBe(false);
    });

    it('should parse backend configuration correctly', () => {
      const config = {
        BACKEND_MODE: 'dual-write',
        BACKEND_GOOGLE_SHEETS_ENABLED: 'false',
        BACKEND_STREAMSOURCE_ENABLED: 'true'
      };
      
      const manager2 = new BackendManager(config, mockLogger);
      expect(manager2.mode).toBe('dual-write');
      expect(manager2.backendsConfig.googleSheets).toBe(false);
      expect(manager2.backendsConfig.streamSource).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize enabled backends', async () => {
      await manager.initialize();

      expect(GoogleSheetsBackend).toHaveBeenCalledWith(mockConfig, mockLogger);
      expect(mockGoogleBackend.initialize).toHaveBeenCalled();
      expect(manager.backends.googleSheets).toBe(mockGoogleBackend);
      expect(manager.primaryBackend).toBe('googleSheets');
    });

    it('should initialize both backends when enabled', async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      
      await manager.initialize();

      expect(GoogleSheetsBackend).toHaveBeenCalled();
      expect(StreamSourceBackend).toHaveBeenCalled();
      expect(mockGoogleBackend.initialize).toHaveBeenCalled();
      expect(mockStreamBackend.initialize).toHaveBeenCalled();
    });

    it('should throw error if primary backend is not enabled', async () => {
      mockConfig.BACKEND_PRIMARY = 'streamSource';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'false';
      manager = new BackendManager(mockConfig, mockLogger);

      await expect(manager.initialize()).rejects.toThrow(
        "Primary backend 'streamSource' is not enabled"
      );
    });
  });

  describe('addStream', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should add stream to primary backend in single mode', async () => {
      const streamData = { url: 'https://twitch.tv/test' };
      const result = await manager.addStream(streamData);

      expect(mockGoogleBackend.addStream).toHaveBeenCalledWith(streamData);
      expect(result).toEqual({ success: true });
    });

    it('should add stream to all backends in dual-write mode', async () => {
      mockConfig.BACKEND_MODE = 'dual-write';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      const streamData = { url: 'https://twitch.tv/test' };
      const result = await manager.addStream(streamData);

      expect(mockGoogleBackend.addStream).toHaveBeenCalledWith(streamData);
      expect(mockStreamBackend.addStream).toHaveBeenCalledWith(streamData);
      expect(result).toEqual({ success: true });
    });

    it('should handle backend failures in dual-write mode', async () => {
      mockConfig.BACKEND_MODE = 'dual-write';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      mockStreamBackend.addStream.mockRejectedValueOnce(new Error('API Error'));

      const streamData = { url: 'https://twitch.tv/test' };
      const result = await manager.addStream(streamData);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to add stream to streamSource: API Error'
      );
      expect(result).toEqual({ success: true }); // Primary backend succeeded
    });

    it('should handle migrate mode', async () => {
      mockConfig.BACKEND_MODE = 'migrate';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      const streamData = { url: 'https://twitch.tv/test' };
      await manager.addStream(streamData);

      // In migrate mode, should write to new backend first
      expect(mockStreamBackend.addStream).toHaveBeenCalledWith(streamData);
      expect(mockGoogleBackend.addStream).toHaveBeenCalledWith(streamData);
    });
  });

  describe('urlExists', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should check primary backend in single mode', async () => {
      mockGoogleBackend.urlExists.mockResolvedValueOnce(true);
      
      const exists = await manager.urlExists('https://twitch.tv/test');
      
      expect(mockGoogleBackend.urlExists).toHaveBeenCalledWith('https://twitch.tv/test');
      expect(exists).toBe(true);
    });

    it('should check all backends in dual-write mode', async () => {
      mockConfig.BACKEND_MODE = 'dual-write';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      mockGoogleBackend.urlExists.mockResolvedValueOnce(false);
      mockStreamBackend.urlExists.mockResolvedValueOnce(true);

      const exists = await manager.urlExists('https://twitch.tv/test');

      expect(mockGoogleBackend.urlExists).toHaveBeenCalled();
      expect(mockStreamBackend.urlExists).toHaveBeenCalled();
      expect(exists).toBe(true);
    });

    it('should handle backend errors gracefully', async () => {
      mockConfig.BACKEND_MODE = 'dual-write';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      mockGoogleBackend.urlExists.mockResolvedValueOnce(false);
      mockStreamBackend.urlExists.mockRejectedValueOnce(new Error('API Error'));

      const exists = await manager.urlExists('https://twitch.tv/test');

      expect(mockLogger.error).toHaveBeenCalled();
      expect(exists).toBe(false);
    });
  });

  describe('getExistingUrls', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should combine URLs from all backends', async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      mockGoogleBackend.getExistingUrls.mockResolvedValueOnce(new Set(['url1', 'url2']));
      mockStreamBackend.getExistingUrls.mockResolvedValueOnce(new Set(['url2', 'url3']));

      const urls = await manager.getExistingUrls();

      expect(urls).toBeInstanceOf(Set);
      expect(urls.size).toBe(3);
      expect([...urls]).toEqual(['url1', 'url2', 'url3']);
    });
  });

  describe('getIgnoreLists', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should use Google Sheets backend when available', async () => {
      const ignoreLists = {
        ignoredUsers: { twitch: new Set(['user1']), discord: new Set(['user2']) },
        ignoredUrls: new Set(['url1'])
      };
      mockGoogleBackend.getIgnoreLists.mockResolvedValueOnce(ignoreLists);

      const result = await manager.getIgnoreLists();

      expect(result).toEqual(ignoreLists);
      expect(mockGoogleBackend.getIgnoreLists).toHaveBeenCalled();
    });

    it('should fall back to primary backend if Google Sheets not available', async () => {
      mockConfig.BACKEND_GOOGLE_SHEETS_ENABLED = 'false';
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      mockConfig.BACKEND_PRIMARY = 'streamSource';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      await manager.getIgnoreLists();

      expect(mockStreamBackend.getIgnoreLists).toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should sync all enabled backends', async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      await manager.sync('urls');

      expect(mockGoogleBackend.sync).toHaveBeenCalledWith('urls');
      expect(mockStreamBackend.sync).toHaveBeenCalledWith('urls');
    });

    it('should handle sync errors gracefully', async () => {
      mockGoogleBackend.sync.mockRejectedValueOnce(new Error('Sync failed'));

      await manager.sync('urls');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing urls in googleSheets: Sync failed'
      );
    });
  });

  describe('shutdown', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should shutdown all backends', async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      await manager.shutdown();

      expect(mockGoogleBackend.shutdown).toHaveBeenCalled();
      expect(mockStreamBackend.shutdown).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Shut down googleSheets backend');
      expect(mockLogger.info).toHaveBeenCalledWith('Shut down streamSource backend');
    });

    it('should handle shutdown errors gracefully', async () => {
      mockGoogleBackend.shutdown.mockRejectedValueOnce(new Error('Shutdown failed'));

      await manager.shutdown();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error shutting down googleSheets: Shutdown failed'
      );
    });
  });

  describe('migrateData', () => {
    beforeEach(async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'true';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();
    });

    it('should migrate URLs between backends', async () => {
      mockGoogleBackend.getExistingUrls.mockResolvedValueOnce(
        new Set(['url1', 'url2', 'url3'])
      );
      mockStreamBackend.getExistingUrls.mockResolvedValueOnce(
        new Set(['url1']) // url1 already exists
      );

      const result = await manager.migrateData('googleSheets', 'streamSource');

      expect(mockStreamBackend.addStream).toHaveBeenCalledTimes(2);
      expect(mockStreamBackend.addStream).toHaveBeenCalledWith({
        url: 'url2',
        source: 'migrated',
        postedBy: 'migration'
      });
      expect(mockStreamBackend.addStream).toHaveBeenCalledWith({
        url: 'url3',
        source: 'migrated',
        postedBy: 'migration'
      });
      expect(result).toEqual({ migrated: 2, failed: 0 });
    });

    it('should handle migration failures', async () => {
      mockGoogleBackend.getExistingUrls.mockResolvedValueOnce(new Set(['url1']));
      mockStreamBackend.getExistingUrls.mockResolvedValueOnce(new Set());
      mockStreamBackend.addStream.mockRejectedValueOnce(new Error('Add failed'));

      const result = await manager.migrateData('googleSheets', 'streamSource');

      expect(result).toEqual({ migrated: 0, failed: 1 });
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to migrate url1: Add failed');
    });

    it('should throw error if backends not enabled', async () => {
      mockConfig.BACKEND_STREAMSOURCE_ENABLED = 'false';
      manager = new BackendManager(mockConfig, mockLogger);
      await manager.initialize();

      await expect(
        manager.migrateData('googleSheets', 'streamSource')
      ).rejects.toThrow('Both backends must be enabled for migration');
    });
  });
});