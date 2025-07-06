const BaseBackend = require('./BaseBackend');
const { google } = require('googleapis');
const { normalizeUrl } = require('../platformDetector');
const { loadCitiesIntoCache, getCacheInfo } = require('../locationParser');

class GoogleSheetsBackend extends BaseBackend {
  constructor(config, logger) {
    super(config, logger);

    // Google Sheets API client
    this.sheets = null;

    // Caches
    this.existingUrlsCache = new Set();
    this.columnMapping = {};
    this.twitchUserIgnoreList = new Set();
    this.discordUserIgnoreList = new Set();
    this.urlIgnoreList = new Set();

    // Mutex for cache operations
    this.cacheUpdateInProgress = false;
  }

  async initialize() {
    this.logger.info('Initializing Google Sheets backend');

    // Setup authentication
    const auth = new google.auth.GoogleAuth({
      keyFile: this.config.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth });

    // Fetch initial data
    await this.fetchColumnMapping();
    await this.fetchExistingUrls();
    await this.fetchIgnoreLists();
    await this.fetchKnownCities();

    this.logger.info('Google Sheets backend initialized');
  }

  async addStream(data) {
    try {
      const timestamp = new Date().toISOString();

      // Create an empty row array based on the number of columns
      const maxColumn = Math.max(...Object.values(this.columnMapping)) + 1;
      const rowValues = new Array(maxColumn).fill('');

      // Map the data to the correct columns
      const setColumnValue = (columnName, value) => {
        const index = this.columnMapping[columnName.toLowerCase()];
        if (index !== undefined) {
          rowValues[index] = value;
        } else {
          this.logger.warn(`Column "${columnName}" not found in sheet headers`);
        }
      };

      // Set the values we want to add
      setColumnValue(this.config.COLUMN_SOURCE, data.source || '');
      setColumnValue(this.config.COLUMN_PLATFORM, data.platform || '');
      setColumnValue(this.config.COLUMN_STATUS, this.config.STATUS_NEW_LINK);
      setColumnValue(this.config.COLUMN_LINK, data.url || '');
      setColumnValue(this.config.COLUMN_ADDED_DATE, timestamp);
      setColumnValue(this.config.COLUMN_POSTED_BY, data.postedBy || '');
      setColumnValue(this.config.COLUMN_CITY, data.city || '');
      setColumnValue(this.config.COLUMN_STATE, data.state || '');

      this.logger.debug(`Adding to sheet: ${data.url}`);
      this.logger.debug(`Row values: ${JSON.stringify(rowValues)}`);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_LIVESTREAMS}!A:A`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowValues] }
      });

      // Add to cache
      await this.acquireMutex();
      try {
        this.existingUrlsCache.add(normalizeUrl(data.url));
      } finally {
        this.releaseMutex();
      }

      this.logger.info(`Added to sheet: ${data.url}`);
      return { success: true, id: data.url };
    } catch (error) {
      this.logger.error(`Error adding to sheet: ${error.message}`);
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
    return {
      ignoredUsers: {
        twitch: new Set(this.twitchUserIgnoreList),
        discord: new Set(this.discordUserIgnoreList)
      },
      ignoredUrls: new Set(this.urlIgnoreList),
      ignoredDomains: new Set() // Not implemented in current system
    };
  }

  async getKnownCities() {
    // This is handled by the locationParser module
    const cacheInfo = getCacheInfo();
    return cacheInfo.cityMap;
  }

  async sync(type) {
    switch (type) {
      case 'urls':
        await this.fetchExistingUrls();
        break;
      case 'ignoreLists':
        await this.fetchIgnoreLists();
        break;
      case 'cities':
        await this.fetchKnownCities();
        break;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  // Private helper methods
  async fetchColumnMapping() {
    try {
      this.logger.info('Fetching column headers from Google Sheets');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_LIVESTREAMS}!1:1`
      });

      const headers = response.data.values?.[0] || [];
      this.columnMapping = {};

      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        this.columnMapping[normalizedHeader] = index;
      });

      this.logger.info(`Column mapping created: ${JSON.stringify(this.columnMapping)}`);
    } catch (error) {
      this.logger.error(`Failed to fetch column headers: ${error.message}`);
      throw error;
    }
  }

  async fetchExistingUrls() {
    await this.acquireMutex();
    try {
      this.logger.info('Fetching existing URLs from Google Sheets');

      const linkColumn = this.columnMapping[this.config.COLUMN_LINK.toLowerCase()];
      let range;

      if (linkColumn === undefined) {
        this.logger.warn('Link column not found in mapping, using default column F');
        range = `${this.config.SHEET_TAB_LIVESTREAMS}!F2:F`;
      } else {
        const columnLetter = String.fromCharCode(65 + linkColumn);
        range = `${this.config.SHEET_TAB_LIVESTREAMS}!${columnLetter}2:${columnLetter}`;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range
      });

      this.existingUrlsCache = new Set(
        (response.data.values || [])
          .map(row => row[0]?.trim())
          .filter(Boolean)
          .map(url => normalizeUrl(url))
      );

      this.logger.info(`Loaded ${this.existingUrlsCache.size} existing URLs from sheet`);
    } catch (error) {
      this.logger.error(`Failed to fetch existing URLs: ${error.message}`);
    } finally {
      this.releaseMutex();
    }
  }

  async fetchIgnoreLists() {
    this.logger.info('Fetching ignore lists from Google Sheets');

    // Fetch Twitch ignore list
    try {
      const twitchResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_TWITCH_IGNORE}!A2:A`
      });

      this.twitchUserIgnoreList = new Set(
        (twitchResponse.data.values || [])
          .map(row => row[0]?.trim()?.toLowerCase())
          .filter(Boolean)
      );
      this.logger.info(`Loaded ${this.twitchUserIgnoreList.size} Twitch users to ignore list`);
    } catch (error) {
      this.logger.error(`Failed to fetch Twitch ignore list: ${error.message}`);
    }

    // Fetch Discord ignore list
    try {
      const discordResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_DISCORD_IGNORE}!A2:A`
      });

      this.discordUserIgnoreList = new Set(
        (discordResponse.data.values || [])
          .map(row => row[0]?.trim()?.toLowerCase())
          .filter(Boolean)
      );
      this.logger.info(`Loaded ${this.discordUserIgnoreList.size} Discord users to ignore list`);
    } catch (error) {
      this.logger.error(`Failed to fetch Discord ignore list: ${error.message}`);
    }

    // Fetch URL ignore list
    try {
      const urlResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_URL_IGNORE}!A2:A`
      });

      this.urlIgnoreList = new Set(
        (urlResponse.data.values || [])
          .map(row => {
            const url = row[0]?.trim();
            return url ? normalizeUrl(url) : null;
          })
          .filter(Boolean)
      );
      this.logger.info(`Loaded ${this.urlIgnoreList.size} URLs to ignore list`);
    } catch (error) {
      this.logger.error(`Failed to fetch URL ignore list: ${error.message}`);
    }
  }

  async fetchKnownCities() {
    try {
      this.logger.info('Fetching known cities from Google Sheets');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.GOOGLE_SHEET_ID,
        range: `${this.config.SHEET_TAB_KNOWN_CITIES}!A2:B`
      });

      const cities = response.data.values || [];
      loadCitiesIntoCache(cities);

      const cacheInfo = getCacheInfo();
      this.logger.info(`Loaded ${cacheInfo.size} known cities into location parser cache`);
    } catch (error) {
      this.logger.error(`Failed to fetch known cities: ${error.message}`);
    }
  }

  // Mutex helpers
  async acquireMutex() {
    while (this.cacheUpdateInProgress) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.cacheUpdateInProgress = true;
  }

  releaseMutex() {
    this.cacheUpdateInProgress = false;
  }
}

module.exports = GoogleSheetsBackend;
