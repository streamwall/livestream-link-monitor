/**
 * Base backend interface for stream management
 * All backend implementations must extend this class
 */
class BaseBackend {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Initialize the backend (authentication, connections, etc.)
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Add a new stream URL
   * @param {Object} data - Stream data
   * @param {string} data.url - The stream URL
   * @param {string} data.source - Source/username
   * @param {string} data.platform - Platform name
   * @param {string} data.city - City name
   * @param {string} data.state - State abbreviation
   * @param {string} data.postedBy - Who posted the link
   * @param {string} data.notes - Additional notes
   * @returns {Promise<Object>} Created stream object
   */
  async addStream(_data) {
    throw new Error('addStream() must be implemented by subclass');
  }

  /**
   * Check if a URL already exists
   * @param {string} url - The URL to check
   * @returns {Promise<boolean>} True if URL exists
   */
  async urlExists(_url) {
    throw new Error('urlExists() must be implemented by subclass');
  }

  /**
   * Get all existing URLs (for deduplication)
   * @returns {Promise<Set<string>>} Set of existing URLs
   */
  async getExistingUrls() {
    throw new Error('getExistingUrls() must be implemented by subclass');
  }

  /**
   * Get ignore lists (users, URLs, domains)
   * @returns {Promise<Object>} Object with ignoredUsers, ignoredUrls, ignoredDomains Sets
   */
  async getIgnoreLists() {
    throw new Error('getIgnoreLists() must be implemented by subclass');
  }

  /**
   * Get known cities for location parsing
   * @returns {Promise<Map>} Map of normalized city names to {city, state} objects
   */
  async getKnownCities() {
    throw new Error('getKnownCities() must be implemented by subclass');
  }

  /**
   * Sync/refresh cached data
   * @param {string} type - Type of data to sync ('urls', 'ignoreLists', 'cities')
   * @returns {Promise<void>}
   */
  async sync(_type) {
    throw new Error('sync() must be implemented by subclass');
  }

  /**
   * Gracefully shut down the backend
   * @returns {Promise<void>}
   */
  async shutdown() {
    // Default implementation - override if needed
    this.logger.info(`Shutting down ${this.constructor.name}`);
  }
}

module.exports = BaseBackend;
