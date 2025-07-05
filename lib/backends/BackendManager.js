const GoogleSheetsBackend = require('./GoogleSheetsBackend');
const StreamSourceBackend = require('./StreamSourceBackend');

class BackendManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.backends = {};
    this.primaryBackend = null;
    
    // Determine which backends to enable
    this.backendsConfig = {
      googleSheets: config.BACKEND_GOOGLE_SHEETS_ENABLED !== 'false',
      streamSource: config.BACKEND_STREAMSOURCE_ENABLED === 'true'
    };
    
    // Mode can be 'single', 'dual-write', or 'migrate'
    this.mode = config.BACKEND_MODE || 'single';
  }

  async initialize() {
    this.logger.info(`Initializing BackendManager in ${this.mode} mode`);
    
    // Initialize Google Sheets backend if enabled
    if (this.backendsConfig.googleSheets) {
      this.backends.googleSheets = new GoogleSheetsBackend(this.config, this.logger);
      await this.backends.googleSheets.initialize();
    }
    
    // Initialize StreamSource backend if enabled
    if (this.backendsConfig.streamSource) {
      this.backends.streamSource = new StreamSourceBackend(this.config, this.logger);
      await this.backends.streamSource.initialize();
    }
    
    // Set primary backend
    this.primaryBackend = this.config.BACKEND_PRIMARY || 'googleSheets';
    
    if (!this.backends[this.primaryBackend]) {
      throw new Error(`Primary backend '${this.primaryBackend}' is not enabled`);
    }
    
    this.logger.info(`Primary backend: ${this.primaryBackend}`);
    this.logger.info(`Enabled backends: ${Object.keys(this.backends).join(', ')}`);
  }

  async addStream(data) {
    const results = {};
    
    switch (this.mode) {
      case 'single':
        // Only write to primary backend
        return await this.backends[this.primaryBackend].addStream(data);
        
      case 'dual-write':
        // Write to all enabled backends
        for (const [name, backend] of Object.entries(this.backends)) {
          try {
            results[name] = await backend.addStream(data);
            this.logger.info(`Successfully added stream to ${name}`);
          } catch (error) {
            this.logger.error(`Failed to add stream to ${name}: ${error.message}`);
            results[name] = { success: false, error: error.message };
          }
        }
        
        // Return primary backend result
        return results[this.primaryBackend] || { success: false };
        
      case 'migrate':
        // Write to new backend first, then old backend
        const newBackend = this.primaryBackend === 'googleSheets' ? 'streamSource' : 'googleSheets';
        
        if (this.backends[newBackend]) {
          try {
            results[newBackend] = await this.backends[newBackend].addStream(data);
          } catch (error) {
            this.logger.error(`Failed to add to new backend ${newBackend}: ${error.message}`);
          }
        }
        
        // Always write to primary backend
        return await this.backends[this.primaryBackend].addStream(data);
        
      default:
        throw new Error(`Unknown backend mode: ${this.mode}`);
    }
  }

  async urlExists(url) {
    // Check primary backend first
    const existsInPrimary = await this.backends[this.primaryBackend].urlExists(url);
    
    if (existsInPrimary || this.mode === 'single') {
      return existsInPrimary;
    }
    
    // In dual-write or migrate mode, check all backends
    for (const [name, backend] of Object.entries(this.backends)) {
      if (name !== this.primaryBackend) {
        try {
          if (await backend.urlExists(url)) {
            return true;
          }
        } catch (error) {
          this.logger.error(`Error checking URL existence in ${name}: ${error.message}`);
        }
      }
    }
    
    return false;
  }

  async getExistingUrls() {
    const allUrls = new Set();
    
    // Collect URLs from all enabled backends
    for (const [name, backend] of Object.entries(this.backends)) {
      try {
        const urls = await backend.getExistingUrls();
        urls.forEach(url => allUrls.add(url));
      } catch (error) {
        this.logger.error(`Error getting existing URLs from ${name}: ${error.message}`);
      }
    }
    
    return allUrls;
  }

  async getIgnoreLists() {
    // Use primary backend for ignore lists
    // StreamSource doesn't support this yet, so fall back to Google Sheets
    const backend = this.backends.googleSheets || this.backends[this.primaryBackend];
    return await backend.getIgnoreLists();
  }

  async getKnownCities() {
    // Use primary backend for known cities
    // StreamSource doesn't support this yet, so fall back to Google Sheets
    const backend = this.backends.googleSheets || this.backends[this.primaryBackend];
    return await backend.getKnownCities();
  }

  async sync(type) {
    // Sync all enabled backends
    const promises = [];
    
    for (const [name, backend] of Object.entries(this.backends)) {
      promises.push(
        backend.sync(type).catch(error => {
          this.logger.error(`Error syncing ${type} in ${name}: ${error.message}`);
        })
      );
    }
    
    await Promise.all(promises);
  }

  async shutdown() {
    // Shutdown all backends
    for (const [name, backend] of Object.entries(this.backends)) {
      try {
        await backend.shutdown();
        this.logger.info(`Shut down ${name} backend`);
      } catch (error) {
        this.logger.error(`Error shutting down ${name}: ${error.message}`);
      }
    }
  }

  // Migration helper
  async migrateData(fromBackend = 'googleSheets', toBackend = 'streamSource') {
    if (!this.backends[fromBackend] || !this.backends[toBackend]) {
      throw new Error(`Both backends must be enabled for migration`);
    }
    
    this.logger.info(`Starting migration from ${fromBackend} to ${toBackend}`);
    
    const sourceUrls = await this.backends[fromBackend].getExistingUrls();
    const targetUrls = await this.backends[toBackend].getExistingUrls();
    
    const urlsToMigrate = [...sourceUrls].filter(url => !targetUrls.has(url));
    
    this.logger.info(`Found ${urlsToMigrate.length} URLs to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const url of urlsToMigrate) {
      try {
        // Note: This is a simplified migration - in practice, you'd need to
        // fetch full stream data from the source backend
        await this.backends[toBackend].addStream({
          url: url,
          source: 'migrated',
          postedBy: 'migration'
        });
        migrated++;
      } catch (error) {
        this.logger.error(`Failed to migrate ${url}: ${error.message}`);
        failed++;
      }
    }
    
    this.logger.info(`Migration complete: ${migrated} succeeded, ${failed} failed`);
    return { migrated, failed };
  }
}

module.exports = BackendManager;