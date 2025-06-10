const { chromium } = require('playwright');
const winston = require('winston');

class BrowserPool {
  constructor(options = {}) {
    this.maxBrowsers = options.maxBrowsers || 3;
    this.browsers = [];
    this.available = [];
    this.waitQueue = [];
    this.logger = options.logger || winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    });
  }

  async initialize() {
    this.logger.info(`Initializing browser pool with ${this.maxBrowsers} browsers`);
    for (let i = 0; i < this.maxBrowsers; i++) {
      try {
        const browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.browsers.push(browser);
        this.available.push(browser);
      } catch (error) {
        this.logger.error(`Failed to launch browser ${i + 1}: ${error.message}`);
      }
    }
    this.logger.info(`Browser pool initialized with ${this.browsers.length} browsers`);
  }

  async acquire() {
    if (this.available.length > 0) {
      return this.available.pop();
    }

    // Wait for a browser to become available
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(browser) {
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      resolve(browser);
    } else {
      this.available.push(browser);
    }
  }

  async shutdown() {
    this.logger.info('Shutting down browser pool');
    await Promise.all(this.browsers.map(browser => browser.close()));
    this.browsers = [];
    this.available = [];
    this.waitQueue = [];
  }

  async withBrowser(fn) {
    const browser = await this.acquire();
    try {
      return await fn(browser);
    } finally {
      this.release(browser);
    }
  }
}

module.exports = BrowserPool;