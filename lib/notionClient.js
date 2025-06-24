const { Client } = require('@notionhq/client');
const winston = require('winston');

class NotionClient {
  constructor(config) {
    this.token = config.NOTION_TOKEN;
    this.databaseId = config.NOTION_DATABASE_ID;
    this.ignoreDatabaseIds = {
      twitchUsers: config.NOTION_TWITCH_IGNORE_DB_ID,
      discordUsers: config.NOTION_DISCORD_IGNORE_DB_ID,
      urls: config.NOTION_URL_IGNORE_DB_ID,
      knownCities: config.NOTION_KNOWN_CITIES_DB_ID
    };

    if (!this.token) {
      throw new Error('NOTION_TOKEN is required for Notion backend');
    }

    if (!this.databaseId) {
      throw new Error('NOTION_DATABASE_ID is required for Notion backend');
    }

    this.notion = new Client({
      auth: this.token,
    });

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
    this.rateLimitDelay = 334; // ~3 requests per second
    this.lastRequestTime = 0;
  }

  async ensureRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  async retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.ensureRateLimit();
        return await fn();
      } catch (error) {
        if (error.code === 'rate_limited' && i < maxRetries - 1) {
          const retryAfter = error.headers?.['retry-after'] || (i + 1) * 1000;
          this.logger.warn(`Rate limited, retrying after ${retryAfter}ms`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else {
          throw error;
        }
      }
    }
  }

  async authenticate() {
    try {
      // Test authentication by retrieving the database
      await this.retryWithBackoff(() =>
        this.notion.databases.retrieve({ database_id: this.databaseId })
      );

      this.logger.info('Successfully authenticated with Notion API');
      return true;
    } catch (error) {
      this.logger.error(`Failed to authenticate with Notion: ${error.message}`);
      throw error;
    }
  }

  async ensureAuthenticated() {
    // Notion uses token-based auth, no need to refresh
    // This method is kept for compatibility with backend interface
  }

  async findOrCreateStreamer(username, platform) {
    // Notion doesn't have a separate streamers table in this implementation
    // We'll store streamer info directly in the stream entry
    // This method returns a mock object for compatibility
    if (!username) {
      return null;
    }

    const cacheKey = `${platform}:${username}`;

    if (this.streamersCache.has(cacheKey)) {
      return this.streamersCache.get(cacheKey);
    }

    const streamer = {
      id: `${platform}-${username}`,
      username: username,
      platform: platform,
      display_name: username
    };

    this.streamersCache.set(cacheKey, streamer);
    return streamer;
  }

  async createStream(streamData) {
    this.logger.info(`Creating stream for URL: ${streamData.url}`);

    try {
      const properties = {
        'Link': {
          url: streamData.url
        },
        'Platform': {
          select: {
            name: this.normalizePlatform(streamData.platform)
          }
        },
        'Status': {
          select: {
            name: 'Live'
          }
        }
      };

      // Add optional properties if they exist
      if (streamData.city) {
        properties['City'] = {
          rich_text: [
            {
              text: {
                content: streamData.city
              }
            }
          ]
        };
      }

      if (streamData.state) {
        properties['State'] = {
          rich_text: [
            {
              text: {
                content: streamData.state
              }
            }
          ]
        };
      }

      if (streamData.postedBy) {
        properties['Posted By'] = {
          rich_text: [
            {
              text: {
                content: streamData.postedBy
              }
            }
          ]
        };
      }

      if (streamData.source) {
        properties['Source'] = {
          title: [
            {
              text: {
                content: streamData.source
              }
            }
          ]
        };
      }

      const response = await this.retryWithBackoff(() =>
        this.notion.pages.create({
          parent: { database_id: this.databaseId },
          properties: properties
        })
      );

      this.logger.info(`Created stream in Notion: ${streamData.url} (ID: ${response.id})`);
      return { id: response.id, ...streamData };

    } catch (error) {
      if (error.code === 'validation_error' && error.message.includes('unique')) {
        // URL already exists
        this.logger.info(`Stream already exists: ${streamData.url}`);
        return { exists: true };
      }
      throw error;
    }
  }

  async getStreams(params = {}) {
    const { search, per_page = 100 } = params;

    try {
      const queryParams = {
        database_id: this.databaseId,
        page_size: Math.min(per_page, 100)
      };

      if (search) {
        queryParams.filter = {
          property: 'Link',
          url: {
            contains: search
          }
        };
      }

      const response = await this.retryWithBackoff(() =>
        this.notion.databases.query(queryParams)
      );

      const streams = response.results.map(page => ({
        id: page.id,
        link: this.getPropertyValue(page.properties.Link, 'url'),
        platform: this.getPropertyValue(page.properties.Platform, 'select'),
        status: this.getPropertyValue(page.properties.Status, 'select'),
        city: this.getPropertyValue(page.properties.City, 'rich_text'),
        state: this.getPropertyValue(page.properties.State, 'rich_text'),
        posted_by: this.getPropertyValue(page.properties['Posted By'], 'rich_text'),
        source: this.getPropertyValue(page.properties.Source, 'title'),
        created_time: page.created_time
      }));

      return { streams, has_more: response.has_more };

    } catch (error) {
      this.logger.error(`Failed to get streams: ${error.message}`);
      throw error;
    }
  }

  async streamExists(url) {
    try {
      const response = await this.getStreams({
        search: url,
        per_page: 1
      });

      return response.streams.some(stream => stream.link === url);
    } catch (error) {
      this.logger.error(`Failed to check if stream exists: ${error.message}`);
      return false;
    }
  }

  async getIgnoreList(type) {
    const databaseId = this.ignoreDatabaseIds[type];
    if (!databaseId) {
      this.logger.warn(`No database ID configured for ignore list type: ${type}`);
      return [];
    }

    try {
      const results = [];
      let hasMore = true;
      let startCursor = undefined;

      while (hasMore) {
        const response = await this.retryWithBackoff(() =>
          this.notion.databases.query({
            database_id: databaseId,
            start_cursor: startCursor,
            page_size: 100
          })
        );

        response.results.forEach(page => {
          const value = this.getPropertyValue(page.properties.Name || page.properties.Title, 'title') ||
                       this.getPropertyValue(page.properties.URL, 'url') ||
                       this.getPropertyValue(page.properties.Username, 'rich_text');

          if (value) {
            results.push(value);
          }
        });

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to fetch ${type} ignore list: ${error.message}`);
      return [];
    }
  }

  async getKnownCities() {
    const databaseId = this.ignoreDatabaseIds.knownCities;
    if (!databaseId) {
      this.logger.warn('No database ID configured for known cities');
      return [];
    }

    try {
      const cities = [];
      let hasMore = true;
      let startCursor = undefined;

      while (hasMore) {
        const response = await this.retryWithBackoff(() =>
          this.notion.databases.query({
            database_id: databaseId,
            start_cursor: startCursor,
            page_size: 100
          })
        );

        response.results.forEach(page => {
          const city = this.getPropertyValue(page.properties.City, 'title') ||
                      this.getPropertyValue(page.properties.Name, 'title');
          const state = this.getPropertyValue(page.properties.State, 'rich_text') ||
                       this.getPropertyValue(page.properties.StateAbbrev, 'rich_text');

          if (city && state) {
            cities.push({ city, state });
          }
        });

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      return cities;
    } catch (error) {
      this.logger.error(`Failed to fetch known cities: ${error.message}`);
      return [];
    }
  }

  getPropertyValue(property, type) {
    if (!property) return null;

    switch (type) {
      case 'title':
        return property.title?.[0]?.plain_text || null;
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || null;
      case 'select':
        return property.select?.name || null;
      case 'status':
        return property.status?.name || null;
      case 'url':
        return property.url || null;
      default:
        return null;
    }
  }

  normalizePlatform(platform) {
    const normalized = platform.toLowerCase();
    const platformMap = {
      'twitch': 'Twitch',
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'kick': 'Kick',
      'facebook': 'Facebook',
      'fb': 'Facebook'
    };

    return platformMap[normalized] || platform;
  }
}

module.exports = NotionClient;