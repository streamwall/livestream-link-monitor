const BaseBackend = require('./BaseBackend');

describe('BaseBackend', () => {
  let backend;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };
    
    backend = new BaseBackend({ test: 'config' }, mockLogger);
  });

  it('should store config and logger', () => {
    expect(backend.config).toEqual({ test: 'config' });
    expect(backend.logger).toBe(mockLogger);
  });

  describe('abstract methods', () => {
    const abstractMethods = [
      'initialize',
      'addStream',
      'urlExists',
      'getExistingUrls',
      'getIgnoreLists',
      'getKnownCities',
      'sync'
    ];

    abstractMethods.forEach(method => {
      it(`should throw error when calling ${method}`, async () => {
        await expect(backend[method]()).rejects.toThrow(
          `${method}() must be implemented by subclass`
        );
      });
    });
  });

  describe('shutdown', () => {
    it('should log shutdown message', async () => {
      await backend.shutdown();
      expect(mockLogger.info).toHaveBeenCalledWith('Shutting down BaseBackend');
    });

    it('should be overrideable by subclasses', async () => {
      class TestBackend extends BaseBackend {
        async shutdown() {
          await super.shutdown();
          this.logger.info('Additional cleanup');
        }
      }

      const testBackend = new TestBackend({}, mockLogger);
      await testBackend.shutdown();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Shutting down TestBackend');
      expect(mockLogger.info).toHaveBeenCalledWith('Additional cleanup');
    });
  });

  describe('subclass implementation', () => {
    it('should allow proper subclass implementation', async () => {
      class TestBackend extends BaseBackend {
        async initialize() {
          return 'initialized';
        }
        
        async addStream(data) {
          return { success: true, data };
        }
        
        async urlExists(url) {
          return url === 'exists';
        }
        
        async getExistingUrls() {
          return new Set(['url1', 'url2']);
        }
        
        async getIgnoreLists() {
          return { ignoredUsers: new Set(), ignoredUrls: new Set() };
        }
        
        async getKnownCities() {
          return new Map();
        }
        
        async sync(type) {
          return `synced ${type}`;
        }
      }

      const testBackend = new TestBackend({}, mockLogger);
      
      expect(await testBackend.initialize()).toBe('initialized');
      expect(await testBackend.addStream({ url: 'test' })).toEqual({
        success: true,
        data: { url: 'test' }
      });
      expect(await testBackend.urlExists('exists')).toBe(true);
      expect(await testBackend.urlExists('not-exists')).toBe(false);
      
      const urls = await testBackend.getExistingUrls();
      expect(urls).toBeInstanceOf(Set);
      expect(urls.size).toBe(2);
      
      expect(await testBackend.sync('urls')).toBe('synced urls');
    });
  });
});