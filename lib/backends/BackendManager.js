const StreamSourceBackend = require('./StreamSourceBackend');

class BackendManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.backend = null;
  }

  async initialize() {
    this.logger.info('Initializing BackendManager with StreamSource');

    // Initialize StreamSource backend
    this.backend = new StreamSourceBackend(this.config, this.logger);
    await this.backend.initialize();

    this.logger.info('StreamSource backend initialized');
  }

  async addStream(data) {
    return await this.backend.addStream(data);
  }

  async urlExists(url) {
    return await this.backend.urlExists(url);
  }

  async getExistingUrls() {
    return await this.backend.getExistingUrls();
  }

  async getIgnoreLists() {
    return await this.backend.getIgnoreLists();
  }

  async getKnownCities() {
    return await this.backend.getKnownCities();
  }

  async sync(type) {
    return await this.backend.sync(type);
  }

  async shutdown() {
    if (this.backend && this.backend.shutdown) {
      await this.backend.shutdown();
    }
  }
}

module.exports = BackendManager;