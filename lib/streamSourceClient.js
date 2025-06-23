const axios = require('axios');
const winston = require('winston');

class StreamSourceClient {
  constructor(config) {
    this.baseUrl = config.STREAMSOURCE_API_URL || 'http://host.docker.internal:3000';
    this.username = config.STREAMSOURCE_USERNAME;
    this.password = config.STREAMSOURCE_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;

    this.logger = winston.createLogger({
      level: config.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: config.LOG_FILE || 'app.log' })
      ]
    });

    this.streamersCache = new Map();
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/users/login`, {
        email: this.username,
        password: this.password
      });

      this.token = response.data.token;
      // JWT typically expires in 24 hours, but we'll refresh more frequently
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours

      this.logger.info('Successfully authenticated with StreamSource API');
      return true;
    } catch (error) {
      this.logger.error(`Failed to authenticate with StreamSource: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async ensureAuthenticated() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async request(method, endpoint, data = null) {
    await this.ensureAuthenticated();

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      this.logger.error(`API request failed: ${method} ${endpoint} - ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async findOrCreateStreamer(username, platform) {
    if (!username) {
      return null;
    }

    const cacheKey = `${platform}:${username}`;

    if (this.streamersCache.has(cacheKey)) {
      return this.streamersCache.get(cacheKey);
    }

    try {
      // Search for existing streamer
      const searchResponse = await this.request('GET', `/api/v1/streamers?search=${encodeURIComponent(username)}`);

      let streamer = searchResponse.data.find(s =>
        s.username?.toLowerCase() === username.toLowerCase() &&
        s.primary_platform?.toLowerCase() === platform.toLowerCase()
      );

      if (!streamer) {
        // Create new streamer
        this.logger.info(`Creating new streamer: ${username} on ${platform}`);
        const createResponse = await this.request('POST', '/api/v1/streamers', {
          username: username,
          primary_platform: platform,
          display_name: username // Use username as display name initially
        });
        streamer = createResponse.data;
      }

      this.streamersCache.set(cacheKey, streamer);
      return streamer;
    } catch (error) {
      this.logger.error(`Failed to find/create streamer ${username}: ${error.message}`);
      return null;
    }
  }

  async createStream(streamData) {
    this.logger.info(`Creating stream for URL: ${streamData.url}`);
    this.logger.info(`Stream data: ${JSON.stringify(streamData)}`);
    const payload = {
      link: streamData.url,
      platform: streamData.platform.toLowerCase(),
      source: streamData.source,
      status: 'Live',
      notes: [],
      city: streamData.city || null,
      state: streamData.state || null,
      postedBy: streamData.postedBy || null,
    };

    // Try to associate with streamer if username is available
    if (streamData.username) {
      const streamer = await this.findOrCreateStreamer(streamData.username, streamData.platform);
      this.logger.info(`Found/created streamer: ${streamer ? streamer.username : 'N/A'}`);
      this.logger.info(`Streamer data: ${JSON.stringify(streamer)}`);
      if (streamer) {
        payload.streamer_id = streamer.id;
      }
    }

    try {
      const response = await this.request('POST', '/api/v1/streams', payload);
      this.logger.info(`Created stream: ${streamData.url} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors?.url) {
        // URL already exists
        this.logger.info(`Stream already exists: ${streamData.url}`);
        return { exists: true };
      }
      throw error;
    }
  }

  async getStreams(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/streams${queryParams ? `?${queryParams}` : ''}`;
    return await this.request('GET', endpoint);
  }

  async streamExists(url) {
    try {
      const response = await this.getStreams({
        search: url,
        per_page: 1
      });
      this.logger.info(`Checked existence of stream: ${url}`);
      this.logger.info(`Response: ${JSON.stringify(response)}`);

      return response.streams.some(stream => stream.link === url);
    } catch (error) {
      this.logger.error(`Failed to check if stream exists: ${error.message}`);
      return false;
    }
  }
}

module.exports = StreamSourceClient;