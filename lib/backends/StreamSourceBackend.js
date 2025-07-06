const BaseBackend = require('./BaseBackend');
const { normalizeUrl } = require('../platformDetector');

class StreamSourceBackend extends BaseBackend {
  constructor(config, logger) {
    super(config, logger);

    this.apiUrl = config.STREAMSOURCE_API_URL || 'https://api.streamsource.com';
    this.token = null;

    // Caches
    this.existingUrlsCache = new Set();
    this.knownCitiesCache = new Map();

    // Rate limiting
    this.rateLimitDelay = 100; // ms between requests
    this.lastRequestTime = 0;
  }

  async initialize() {
    this.logger.info('Initializing StreamSource backend');

    // Authenticate
    await this.authenticate();

    // Fetch initial data
    await this.fetchExistingStreams();

    // Note: StreamSource doesn't have ignore lists or known cities API yet
    this.logger.warn('StreamSource backend: Ignore lists and known cities management not yet implemented in API');

    this.logger.info('StreamSource backend initialized');
  }

  async authenticate() {
    try {
      this.logger.info('Authenticating with StreamSource API');

      const response = await this.request('/api/v1/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.config.STREAMSOURCE_EMAIL,
          password: this.config.STREAMSOURCE_PASSWORD
        }),
        skipAuth: true // Don't include token for login
      });

      this.token = response.token;
      this.logger.info('Successfully authenticated with StreamSource');
    } catch (error) {
      this.logger.error(`Failed to authenticate with StreamSource: ${error.message}`);
      throw error;
    }
  }

  async addStream(data) {
    try {
      const streamData = {
        source: data.source || data.postedBy || 'Unknown',
        link: data.url,
        status: 'offline', // Default status for new streams
        platform: data.platform,
        city: data.city,
        state: data.state,
        notes: data.notes || `Added by ${data.postedBy || 'link monitor'}`,
        postedBy: data.postedBy
      };

      this.logger.debug(`Creating stream in StreamSource: ${JSON.stringify(streamData)}`);

      const response = await this.request('/api/v1/streams', {
        method: 'POST',
        body: JSON.stringify(streamData)
      });

      // Add to cache
      this.existingUrlsCache.add(normalizeUrl(data.url));

      this.logger.info(`Created stream in StreamSource: ${data.url} (ID: ${response.id})`);
      return { success: true, id: response.id };
    } catch (error) {
      this.logger.error(`Error creating stream in StreamSource: ${error.message}`);
      throw error;
    }
  }

  async urlExists(url) {
    const normalizedUrl = normalizeUrl(url);
    return this.existingUrlsCache.has(normalizedUrl);
  }

  async getExistingUrls() {
    return new Set(this.existingUrlsCache);
  }

  async getIgnoreLists() {
    // StreamSource doesn't support ignore lists yet
    this.logger.warn('StreamSource: Ignore lists not supported');
    return {
      ignoredUsers: {
        twitch: new Set(),
        discord: new Set()
      },
      ignoredUrls: new Set(),
      ignoredDomains: new Set()
    };
  }

  async getKnownCities() {
    // StreamSource doesn't have a known cities API yet
    this.logger.warn('StreamSource: Known cities API not available');
    return this.knownCitiesCache;
  }

  async sync(type) {
    switch (type) {
      case 'urls':
        await this.fetchExistingStreams();
        break;
      case 'ignoreLists':
        this.logger.warn('StreamSource: Ignore lists sync not supported');
        break;
      case 'cities':
        this.logger.warn('StreamSource: Known cities sync not supported');
        break;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  // Private helper methods
  async request(endpoint, options = {}) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.delay(this.rateLimitDelay - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token unless explicitly skipped
    if (!options.skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));

        // Handle rate limiting
        if (response.status === 429) {
          this.rateLimitDelay *= 2; // Exponential backoff
          this.logger.warn(`Rate limited, increasing delay to ${this.rateLimitDelay}ms`);
        }

        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Reset rate limit delay on successful request
      this.rateLimitDelay = 100;

      return await response.json();
    } catch (error) {
      this.logger.error(`StreamSource API request failed: ${error.message}`);
      throw error;
    }
  }

  async fetchExistingStreams() {
    try {
      this.logger.info('Fetching existing streams from StreamSource');
      this.existingUrlsCache.clear();

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.request(`/api/v1/streams?page=${page}&per_page=100`);

        for (const stream of response.streams) {
          if (stream.link) {
            this.existingUrlsCache.add(normalizeUrl(stream.link));
          }
        }

        hasMore = page < response.meta.total_pages;
        page++;

        this.logger.debug(`Fetched page ${page - 1} of ${response.meta.total_pages}`);
      }

      this.logger.info(`Loaded ${this.existingUrlsCache.size} existing URLs from StreamSource`);
    } catch (error) {
      this.logger.error(`Failed to fetch existing streams: ${error.message}`);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    await super.shutdown();
    // Any StreamSource-specific cleanup
  }
}

module.exports = StreamSourceBackend;
