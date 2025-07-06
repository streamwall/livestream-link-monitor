const GoogleSheetsBackend = require('./GoogleSheetsBackend');
const { google } = require('googleapis');

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn()
    },
    sheets: jest.fn()
  }
}));

describe('GoogleSheetsBackend', () => {
  let backend;
  let mockLogger;
  let mockConfig;
  let mockSheets;
  let mockAuth;
  let mockSheetsApi;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    mockConfig = {
      GOOGLE_CREDENTIALS_PATH: './test-credentials.json',
      GOOGLE_SHEET_ID: 'test-sheet-id',
      SHEET_TAB_LIVESTREAMS: 'Livesheet',
      SHEET_TAB_TWITCH_IGNORE: 'Twitch Ignore',
      SHEET_TAB_DISCORD_IGNORE: 'Discord Ignore',
      SHEET_TAB_URL_IGNORE: 'URL Ignore',
      SHEET_TAB_KNOWN_CITIES: 'Known Cities',
      COLUMN_LINK: 'Link',
      COLUMN_SOURCE: 'Source',
      COLUMN_PLATFORM: 'Platform',
      COLUMN_STATUS: 'Status',
      COLUMN_POSTED_BY: 'Posted By',
      COLUMN_ADDED_DATE: 'Added Date',
      COLUMN_CITY: 'City',
      COLUMN_STATE: 'State',
      STATUS_NEW_LINK: 'Live',
      TIMEZONE: 'America/Los_Angeles'
    };

    // Mock sheets API responses
    mockSheetsApi = {
      get: jest.fn(),
      append: jest.fn(),
      batchGet: jest.fn()
    };

    mockSheets = {
      spreadsheets: {
        values: mockSheetsApi
      }
    };

    mockAuth = {
      getClient: jest.fn().mockResolvedValue({})
    };

    google.auth.GoogleAuth.mockReturnValue(mockAuth);
    google.sheets.mockReturnValue(mockSheets);

    backend = new GoogleSheetsBackend(mockConfig, mockLogger);
  });

  describe('initialize', () => {
    it('should initialize Google Sheets client and fetch initial data', async () => {
      // Mock column headers response
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source', 'Platform', 'Status', 'Posted By', 'Added Date', 'City', 'State']]
        }
      });

      // Mock existing URLs response
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Link', 'Source'],
            ['https://twitch.tv/user1', 'Discord'],
            ['https://youtube.com/watch?v=123', 'Twitch']
          ]
        }
      });

      // Mock ignore lists response
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: {
          valueRanges: [
            { values: [['Username'], ['user1'], ['user2']] }, // Twitch ignore
            { values: [['Username'], ['discorduser1']] }, // Discord ignore
            { values: [['URL'], ['https://blocked.com']] } // URL ignore
          ]
        }
      });

      // Mock known cities response
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['City', 'State'],
            ['New York City', 'NY'],
            ['Los Angeles', 'CA']
          ]
        }
      });

      await backend.initialize();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        keyFile: './test-credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      expect(mockAuth.getClient).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('GoogleSheetsBackend initialized');
    });

    it('should handle authentication errors', async () => {
      mockAuth.getClient.mockRejectedValueOnce(new Error('Auth failed'));

      await expect(backend.initialize()).rejects.toThrow('Auth failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to initialize GoogleSheetsBackend:',
        expect.any(Error)
      );
    });

    it('should handle missing column headers', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [] }
      });

      await expect(backend.initialize()).rejects.toThrow('No headers found');
    });
  });

  describe('addStream', () => {
    beforeEach(async () => {
      // Setup successful initialization
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source', 'Platform', 'Status', 'Posted By', 'Added Date', 'City', 'State']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['Link']] }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();
    });

    it('should add a new stream with all data', async () => {
      const streamData = {
        url: 'https://twitch.tv/newuser',
        source: 'Discord',
        platform: 'Twitch',
        postedBy: 'testuser',
        city: 'New York City',
        state: 'NY'
      };

      mockSheetsApi.append.mockResolvedValueOnce({
        data: { updates: { updatedCells: 8 } }
      });

      const result = await backend.addStream(streamData);

      expect(mockSheetsApi.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id',
        range: 'Livesheet!A2:H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'https://twitch.tv/newuser',
            'Discord',
            'Twitch',
            'Live',
            'testuser',
            expect.stringMatching(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M$/),
            'New York City',
            'NY'
          ]]
        }
      });

      expect(result).toEqual({ success: true });
      expect(backend.existingUrls.has('https://twitch.tv/newuser')).toBe(true);
    });

    it('should handle partial data', async () => {
      const streamData = {
        url: 'https://youtube.com/watch?v=456',
        source: 'Twitch'
      };

      mockSheetsApi.append.mockResolvedValueOnce({
        data: { updates: { updatedCells: 8 } }
      });

      await backend.addStream(streamData);

      expect(mockSheetsApi.append).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id',
        range: 'Livesheet!A2:H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'https://youtube.com/watch?v=456',
            'Twitch',
            '',
            'Live',
            '',
            expect.any(String),
            '',
            ''
          ]]
        }
      });
    });

    it('should handle append errors', async () => {
      mockSheetsApi.append.mockRejectedValueOnce(new Error('API Error'));

      const streamData = { url: 'https://twitch.tv/test' };
      
      await expect(backend.addStream(streamData)).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error adding stream to Google Sheets:',
        expect.any(Error)
      );
    });
  });

  describe('urlExists', () => {
    beforeEach(async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Link', 'Source'],
            ['https://twitch.tv/existing', 'Discord']
          ]
        }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();
    });

    it('should return true for existing URLs', async () => {
      expect(await backend.urlExists('https://twitch.tv/existing')).toBe(true);
    });

    it('should return false for non-existing URLs', async () => {
      expect(await backend.urlExists('https://twitch.tv/notexisting')).toBe(false);
    });

    it('should handle errors by returning false', async () => {
      // Force an error by clearing existingUrls
      backend.existingUrls = null;
      
      expect(await backend.urlExists('https://twitch.tv/test')).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getIgnoreLists', () => {
    beforeEach(async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [] }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: {
          valueRanges: [
            { values: [['Username'], ['twitchuser1'], ['twitchuser2']] },
            { values: [['Username'], ['discorduser1']] },
            { values: [['URL'], ['https://blocked.com'], ['blocked2.com']] }
          ]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();
    });

    it('should return ignore lists', async () => {
      const ignoreLists = await backend.getIgnoreLists();

      expect(ignoreLists.ignoredUsers.twitch).toBeInstanceOf(Set);
      expect(ignoreLists.ignoredUsers.twitch.has('twitchuser1')).toBe(true);
      expect(ignoreLists.ignoredUsers.twitch.has('twitchuser2')).toBe(true);
      
      expect(ignoreLists.ignoredUsers.discord).toBeInstanceOf(Set);
      expect(ignoreLists.ignoredUsers.discord.has('discorduser1')).toBe(true);
      
      expect(ignoreLists.ignoredUrls).toBeInstanceOf(Set);
      expect(ignoreLists.ignoredUrls.has('https://blocked.com')).toBe(true);
      expect(ignoreLists.ignoredUrls.has('https://blocked2.com')).toBe(true);
    });
  });

  describe('getKnownCities', () => {
    beforeEach(async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [] }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['City', 'State'],
            ['New York City', 'NY'],
            ['Los Angeles', 'CA']
          ]
        }
      });

      await backend.initialize();
    });

    it('should return known cities map', async () => {
      const cities = await backend.getKnownCities();

      expect(cities).toBeInstanceOf(Map);
      expect(cities.size).toBe(2);
      expect(cities.get('New York City')).toBe('NY');
      expect(cities.get('Los Angeles')).toBe('CA');
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      // Initialize with basic setup
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [] }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();
    });

    it('should sync urls', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Link', 'Source'],
            ['https://twitch.tv/newurl', 'Discord']
          ]
        }
      });

      await backend.sync('urls');

      expect(backend.existingUrls.has('https://twitch.tv/newurl')).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Synced 1 existing URLs from Google Sheets');
    });

    it('should sync ignoreLists', async () => {
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: {
          valueRanges: [
            { values: [['Username'], ['newuser']] },
            { values: [] },
            { values: [] }
          ]
        }
      });

      await backend.sync('ignoreLists');

      const ignoreLists = await backend.getIgnoreLists();
      expect(ignoreLists.ignoredUsers.twitch.has('newuser')).toBe(true);
    });

    it('should sync cities', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['City', 'State'],
            ['Chicago', 'IL']
          ]
        }
      });

      await backend.sync('cities');

      const cities = await backend.getKnownCities();
      expect(cities.get('Chicago')).toBe('IL');
    });

    it('should handle sync errors gracefully', async () => {
      mockSheetsApi.get.mockRejectedValueOnce(new Error('Sync failed'));

      await backend.sync('urls');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing urls from Google Sheets:',
        expect.any(Error)
      );
    });
  });

  describe('getExistingUrls', () => {
    it('should return existing URLs set', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Link', 'Source'],
            ['https://url1.com', 'Discord'],
            ['https://url2.com', 'Twitch']
          ]
        }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();
      
      const urls = await backend.getExistingUrls();
      expect(urls).toBeInstanceOf(Set);
      expect(urls.size).toBe(2);
      expect(urls.has('https://url1.com')).toBe(true);
      expect(urls.has('https://url2.com')).toBe(true);
    });
  });

  describe('fetchColumnMapping', () => {
    it('should handle missing Link column', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Source', 'Platform']] // Missing Link column
        }
      });

      await expect(backend.fetchColumnMapping()).rejects.toThrow(
        'Required column "Link" not found'
      );
    });

    it('should map columns correctly', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Source', 'Link', 'Platform']] // Different order
        }
      });

      await backend.fetchColumnMapping();

      expect(backend.columnMapping.Link).toBe(1); // 0-indexed
      expect(backend.columnMapping.Source).toBe(0);
      expect(backend.columnMapping.Platform).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty sheets gracefully', async () => {
      mockSheetsApi.get.mockResolvedValue({
        data: { values: [] }
      });
      mockSheetsApi.batchGet.mockResolvedValue({
        data: { valueRanges: [] }
      });

      await expect(backend.initialize()).rejects.toThrow();
    });

    it('should handle malformed data', async () => {
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [['Link', 'Source']]
        }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: {
          values: [
            ['Link', 'Source'],
            [''], // Empty URL
            [null, 'Discord'], // Null URL
            ['https://valid.com'] // Valid URL
          ]
        }
      });
      mockSheetsApi.batchGet.mockResolvedValueOnce({
        data: { valueRanges: [{ values: [] }, { values: [] }, { values: [] }] }
      });
      mockSheetsApi.get.mockResolvedValueOnce({
        data: { values: [['City', 'State']] }
      });

      await backend.initialize();

      const urls = await backend.getExistingUrls();
      expect(urls.size).toBe(1); // Only valid URL
      expect(urls.has('https://valid.com')).toBe(true);
    });
  });
});