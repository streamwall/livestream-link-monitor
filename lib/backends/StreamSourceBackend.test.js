const StreamSourceBackend = require('./StreamSourceBackend');
// const { Mutex } = require('async-mutex');

// Mock fetch
global.fetch = jest.fn();

// Mock async-mutex
jest.mock('async-mutex', () => ({
  Mutex: jest.fn(() => ({
    acquire: jest.fn().mockResolvedValue(() => {})
  }))
}));

describe('StreamSourceBackend', () => {
  let backend;
  let mockLogger;
  let mockConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockConfig = {
      STREAMSOURCE_API_URL: 'https://api.test.com',
      STREAMSOURCE_EMAIL: 'test@example.com',
      STREAMSOURCE_PASSWORD: 'testpass123'
    };

    backend = new StreamSourceBackend(mockConfig, mockLogger);
  });

  describe('initialize', () => {
    it('should authenticate and fetch initial data', async () => {
      // Mock authentication response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'test-jwt-token',
          user: { id: '123', email: 'test@example.com' }
        })
      });

      // Mock streams response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { id: '1', url: 'https://twitch.tv/user1' },
            { id: '2', url: 'https://youtube.com/watch?v=123' }
          ]
        })
      });

      await backend.initialize();

      expect(fetch).toHaveBeenCalledWith('https://api.test.com/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });

      expect(backend.token).toBe('test-jwt-token');
      expect(backend.existingUrls.size).toBe(2);
      expect(backend.existingUrls.has('https://twitch.tv/user1')).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('StreamSourceBackend initialized');
    });

    it('should handle authentication failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Invalid credentials')
      });

      await expect(backend.initialize()).rejects.toThrow('Authentication failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize StreamSourceBackend:',
        expect.any(Error)
      );
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(backend.initialize()).rejects.toThrow('Network error');
    });
  });

  describe('request', () => {
    beforeEach(() => {
      backend.token = 'test-token';
    });

    it('should make authenticated requests', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      });

      const result = await backend.request('/test', {
        method: 'GET'
      });

      expect(fetch).toHaveBeenCalledWith('https://api.test.com/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(result).toEqual({ data: 'test' });
    });

    it('should handle rate limiting with retry', async () => {
      jest.useFakeTimers();

      // First request fails with 429
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue('2') // Retry-After header
        },
        text: jest.fn().mockResolvedValue('Rate limited')
      });

      // Retry succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      });

      const requestPromise = backend.request('/test', { attempts: 1 });

      // Fast-forward time
      jest.advanceTimersByTime(2000);

      const result = await requestPromise;
      expect(result).toEqual({ data: 'success' });
      expect(mockLogger.warn).toHaveBeenCalledWith('Rate limited, retrying after 2 seconds...');

      jest.useRealTimers();
    });

    it('should re-authenticate on 401', async () => {
      // First request fails with 401
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized')
      });

      // Re-authentication
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'new-token'
        })
      });

      // Retry succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      });

      const result = await backend.request('/test');

      expect(backend.token).toBe('new-token');
      expect(result).toEqual({ data: 'success' });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error')
      });

      await expect(backend.request('/test')).rejects.toThrow('HTTP error! status: 500');
      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should skip auth for login endpoint', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: 'token' })
      });

      await backend.request('/api/v1/users/login', {
        method: 'POST',
        body: '{}',
        skipAuth: true
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });

  describe('addStream', () => {
    beforeEach(async () => {
      // Mock successful initialization
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'test-token'
        })
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ streams: [] })
      });

      await backend.initialize();
    });

    it('should add a new stream successfully', async () => {
      const streamData = {
        url: 'https://twitch.tv/newuser',
        source: 'Discord',
        platform: 'Twitch',
        postedBy: 'testuser',
        city: 'New York',
        state: 'NY'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '123',
          url: 'https://twitch.tv/newuser',
          success: true
        })
      });

      const result = await backend.addStream(streamData);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/streams',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            url: 'https://twitch.tv/newuser',
            source: 'Discord',
            metadata: {
              platform: 'Twitch',
              postedBy: 'testuser',
              city: 'New York',
              state: 'NY'
            }
          })
        })
      );

      expect(result).toEqual({ success: true });
      expect(backend.existingUrls.has('https://twitch.tv/newuser')).toBe(true);
    });

    it('should handle minimal stream data', async () => {
      const streamData = {
        url: 'https://youtube.com/watch?v=456'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      });

      await backend.addStream(streamData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            url: 'https://youtube.com/watch?v=456',
            source: 'unknown',
            metadata: {}
          })
        })
      );
    });

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid URL')
      });

      await expect(backend.addStream({ url: 'invalid' })).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('urlExists', () => {
    beforeEach(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: 'test-token' })
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { url: 'https://twitch.tv/existing' }
          ]
        })
      });

      await backend.initialize();
    });

    it('should return true for existing URLs', async () => {
      expect(await backend.urlExists('https://twitch.tv/existing')).toBe(true);
    });

    it('should return false for non-existing URLs', async () => {
      expect(await backend.urlExists('https://twitch.tv/notexisting')).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      backend.existingUrls = null; // Force an error

      expect(await backend.urlExists('https://test.com')).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getExistingUrls', () => {
    it('should return existing URLs set', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: 'test-token' })
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { url: 'https://url1.com' },
            { url: 'https://url2.com' }
          ]
        })
      });

      await backend.initialize();

      const urls = await backend.getExistingUrls();
      expect(urls).toBeInstanceOf(Set);
      expect(urls.size).toBe(2);
      expect(urls.has('https://url1.com')).toBe(true);
    });
  });

  describe('getIgnoreLists', () => {
    it('should return empty ignore lists', async () => {
      const ignoreLists = await backend.getIgnoreLists();

      expect(ignoreLists).toEqual({
        ignoredUsers: {
          twitch: new Set(),
          discord: new Set()
        },
        ignoredUrls: new Set()
      });
    });
  });

  describe('getKnownCities', () => {
    it('should return empty cities map', async () => {
      const cities = await backend.getKnownCities();

      expect(cities).toBeInstanceOf(Map);
      expect(cities.size).toBe(0);
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: 'test-token' })
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ streams: [] })
      });

      await backend.initialize();
    });

    it('should sync URLs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { url: 'https://twitch.tv/newstream' },
            { url: 'https://youtube.com/new' }
          ]
        })
      });

      await backend.sync('urls');

      expect(backend.existingUrls.size).toBe(2);
      expect(backend.existingUrls.has('https://twitch.tv/newstream')).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Synced 2 existing URLs from StreamSource');
    });

    it('should skip sync for unsupported types', async () => {
      await backend.sync('ignoreLists');
      await backend.sync('cities');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await backend.sync('urls');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing urls from StreamSource:',
        expect.any(Error)
      );
    });
  });

  describe('fetchExistingUrls', () => {
    beforeEach(() => {
      backend.token = 'test-token';
    });

    it('should handle paginated results', async () => {
      // First page
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { url: 'https://url1.com' },
            { url: 'https://url2.com' }
          ],
          hasMore: true,
          nextCursor: 'cursor123'
        })
      });

      // Second page
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          streams: [
            { url: 'https://url3.com' }
          ],
          hasMore: false
        })
      });

      await backend.fetchExistingUrls();

      expect(backend.existingUrls.size).toBe(3);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/streams?limit=100&cursor=cursor123',
        expect.any(Object)
      );
    });

    it('should handle empty response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      });

      await backend.fetchExistingUrls();

      expect(backend.existingUrls.size).toBe(0);
    });
  });

  describe('authenticate', () => {
    it('should store authentication token', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'new-auth-token',
          expiresIn: 86400
        })
      });

      await backend.authenticate();

      expect(backend.token).toBe('new-auth-token');
      expect(mockLogger.info).toHaveBeenCalledWith('Successfully authenticated with StreamSource API');
    });

    it('should throw on authentication failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Forbidden')
      });

      await expect(backend.authenticate()).rejects.toThrow('Authentication failed');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when token is null', () => {
      backend.token = null;
      expect(backend.isTokenExpired()).toBe(true);
    });

    it('should return true when token is expired', () => {
      backend.tokenExpiry = Date.now() - 1000; // Expired 1 second ago
      backend.token = 'some-token';
      expect(backend.isTokenExpired()).toBe(true);
    });

    it('should return false when token is valid', () => {
      backend.tokenExpiry = Date.now() + 3600000; // Expires in 1 hour
      backend.token = 'valid-token';
      expect(backend.isTokenExpired()).toBe(false);
    });
  });

  describe('shutdown', () => {
    it('should log shutdown message', async () => {
      await backend.shutdown();
      expect(mockLogger.info).toHaveBeenCalledWith('Shutting down StreamSourceBackend');
    });
  });
});
