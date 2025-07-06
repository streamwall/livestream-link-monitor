const {
  loadCitiesIntoCache,
  parseLocation,
  getCacheInfo,
  clearCache
} = require('./locationParser');

describe('locationParser', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('loadCitiesIntoCache', () => {
    it('should load cities into cache', () => {
      const cities = [
        ['New York City', 'NY'],
        ['Los Angeles', 'CA'],
        ['Chicago', 'IL']
      ];

      loadCitiesIntoCache(cities);
      
      const cacheInfo = getCacheInfo();
      expect(cacheInfo.size).toBe(3);
    });

    it('should normalize city names for lookup', () => {
      const cities = [
        ['New York City', 'NY'],
        ['Los Angeles', 'CA']
      ];

      loadCitiesIntoCache(cities);
      
      // Should find with different cases
      expect(parseLocation('I am in new york city')).toEqual({
        city: 'New York City',
        state: 'NY'
      });
    });

    it('should handle empty data', () => {
      loadCitiesIntoCache([]);
      expect(getCacheInfo().size).toBe(0);
      
      loadCitiesIntoCache(null);
      expect(getCacheInfo().size).toBe(0);
      
      loadCitiesIntoCache(undefined);
      expect(getCacheInfo().size).toBe(0);
    });

    it('should handle malformed data', () => {
      const cities = [
        ['Chicago', 'IL'],
        ['', 'CA'], // Empty city
        ['Dallas'], // Missing state
        [], // Empty array
        null // Null entry
      ];

      loadCitiesIntoCache(cities);
      
      const cacheInfo = getCacheInfo();
      expect(cacheInfo.size).toBe(1); // Only Chicago should be loaded
    });
  });

  describe('parseLocation with aliases', () => {
    beforeEach(() => {
      const cities = [
        ['New York City', 'NY'],
        ['Los Angeles', 'CA'],
        ['San Francisco', 'SF'],
        ['Washington', 'DC']
      ];
      loadCitiesIntoCache(cities);
    });

    it('should parse common city aliases', () => {
      expect(parseLocation('Live from NYC!')).toEqual({
        city: 'New York City',
        state: 'NY'
      });

      expect(parseLocation('Streaming from LA')).toEqual({
        city: 'Los Angeles',
        state: 'CA'
      });

      expect(parseLocation('SF bay area')).toEqual({
        city: 'San Francisco',
        state: 'SF'
      });

      expect(parseLocation('DC meetup')).toEqual({
        city: 'Washington',
        state: 'DC'
      });
    });

    it('should handle case variations of aliases', () => {
      expect(parseLocation('nyc stream')).toEqual({
        city: 'New York City',
        state: 'NY'
      });

      expect(parseLocation('la concert')).toEqual({
        city: 'Los Angeles',
        state: 'CA'
      });
    });
  });

  describe('parseLocation patterns', () => {
    beforeEach(() => {
      const cities = [
        ['Austin', 'TX'],
        ['Denver', 'CO'],
        ['Seattle', 'WA'],
        ['Miami', 'FL']
      ];
      loadCitiesIntoCache(cities);
    });

    it('should parse "city, state" pattern', () => {
      expect(parseLocation('Live from Austin, TX')).toEqual({
        city: 'Austin',
        state: 'TX'
      });

      expect(parseLocation('denver, co concert')).toEqual({
        city: 'Denver',
        state: 'CO'
      });
    });

    it('should parse "city state" pattern', () => {
      expect(parseLocation('Seattle WA show')).toEqual({
        city: 'Seattle',
        state: 'WA'
      });

      expect(parseLocation('miami fl beach stream')).toEqual({
        city: 'Miami',
        state: 'FL'
      });
    });

    it('should handle multiple spaces', () => {
      expect(parseLocation('Austin,    TX')).toEqual({
        city: 'Austin',
        state: 'TX'
      });
    });

    it('should extract location from longer text', () => {
      const text = 'Hey everyone! Streaming live from Denver, CO today at the convention center';
      expect(parseLocation(text)).toEqual({
        city: 'Denver',
        state: 'CO'
      });
    });
  });

  describe('parseLocation without pattern match', () => {
    beforeEach(() => {
      const cities = [
        ['Boston', 'MA'],
        ['Portland', 'OR'],
        ['Phoenix', 'AZ']
      ];
      loadCitiesIntoCache(cities);
    });

    it('should find city name in text', () => {
      expect(parseLocation('Boston marathon stream')).toEqual({
        city: 'Boston',
        state: 'MA'
      });

      expect(parseLocation('Live from downtown Portland')).toEqual({
        city: 'Portland',
        state: 'OR'
      });
    });

    it('should handle city at different positions', () => {
      expect(parseLocation('Phoenix show')).toEqual({
        city: 'Phoenix',
        state: 'AZ'
      });

      expect(parseLocation('Show in Phoenix')).toEqual({
        city: 'Phoenix',
        state: 'AZ'
      });

      expect(parseLocation('The Phoenix event')).toEqual({
        city: 'Phoenix',
        state: 'AZ'
      });
    });
  });

  describe('parseLocation edge cases', () => {
    it('should return null when no cities loaded', () => {
      expect(parseLocation('New York City')).toBeNull();
    });

    it('should return null for empty input', () => {
      loadCitiesIntoCache([['Chicago', 'IL']]);
      
      expect(parseLocation('')).toBeNull();
      expect(parseLocation(null)).toBeNull();
      expect(parseLocation(undefined)).toBeNull();
    });

    it('should return null when no match found', () => {
      loadCitiesIntoCache([['Chicago', 'IL']]);
      
      expect(parseLocation('Random text without city')).toBeNull();
      expect(parseLocation('12345')).toBeNull();
    });

    it('should handle special characters', () => {
      loadCitiesIntoCache([['San José', 'CA']]);
      
      expect(parseLocation('Live from San José, CA')).toEqual({
        city: 'San José',
        state: 'CA'
      });
    });
  });

  describe('getCacheInfo', () => {
    it('should return cache information', () => {
      const cities = [
        ['City1', 'S1'],
        ['City2', 'S2'],
        ['City3', 'S3']
      ];

      loadCitiesIntoCache(cities);
      
      const info = getCacheInfo();
      expect(info.size).toBe(3);
      expect(info.cityMap).toBeDefined();
      expect(info.cityMap.size).toBe(3);
    });

    it('should include aliases in cache info', () => {
      loadCitiesIntoCache([['New York City', 'NY']]);
      
      const info = getCacheInfo();
      expect(info.cityMap.has('new york city')).toBe(true);
      expect(info.cityMap.has('nyc')).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', () => {
      loadCitiesIntoCache([
        ['City1', 'S1'],
        ['City2', 'S2']
      ]);
      
      expect(getCacheInfo().size).toBe(2);
      
      clearCache();
      
      expect(getCacheInfo().size).toBe(0);
      expect(parseLocation('City1, S1')).toBeNull();
    });
  });
});