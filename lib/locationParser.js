// locationParser.js
let logger;

// Try to use winston if available, otherwise use console
try {
  const winston = require('winston');
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
} catch (error) {
  // Fallback to console if winston is not available
  logger = {
    info: console.log,
    debug: console.log,
    warn: console.warn,
    error: console.error
  };
}

// Cache for known cities
let knownCitiesCache = new Map(); // Map of normalized city name -> {city, state}
let lastCacheUpdate = 0;

// Common city aliases/abbreviations
const cityAliases = {
  'nyc': 'New York City',
  'la': 'Los Angeles',
  'sf': 'San Francisco',
  'philly': 'Philadelphia',
  'vegas': 'Las Vegas',
  'nola': 'New Orleans',
  'dc': 'Washington',
  'atl': 'Atlanta',
  'chi': 'Chicago',
  'bmore': 'Baltimore',
  'pdx': 'Portland',
  'stl': 'St. Louis',
  'kc': 'Kansas City',
  'nj': 'New Jersey',
  'sd': 'San Diego',
  'sj': 'San Jose',
  'oak': 'Oakland',
  'sac': 'Sacramento',
  'lv': 'Las Vegas',
  'slc': 'Salt Lake City',
  'abq': 'Albuquerque',
  'okc': 'Oklahoma City',
  'jax': 'Jacksonville',
  'clt': 'Charlotte',
  'rdu': 'Raleigh-Durham',
  'atx': 'Austin',
  'dfw': 'Dallas-Fort Worth',
  'hou': 'Houston',
  'sa': 'San Antonio',
  'mia': 'Miami',
  'orl': 'Orlando',
  'tb': 'Tampa Bay',
  'bos': 'Boston',
  'phl': 'Philadelphia',
  'pit': 'Pittsburgh',
  'cle': 'Cleveland',
  'cin': 'Cincinnati',
  'det': 'Detroit',
  'mke': 'Milwaukee',
  'msp': 'Minneapolis-St. Paul',
  'stl': 'St. Louis',
  'ind': 'Indianapolis',
  'col': 'Columbus',
  'nash': 'Nashville',
  'mem': 'Memphis',
  'lou': 'Louisville',
  'bham': 'Birmingham',
  'msy': 'New Orleans',
  'rva': 'Richmond',
  'nor': 'Norfolk',
  'ral': 'Raleigh',
  'dur': 'Durham',
  'gsp': 'Greenville-Spartanburg',
  'jville': 'Jacksonville',
  'tpa': 'Tampa',
  'ft lauderdale': 'Fort Lauderdale',
  'ft. lauderdale': 'Fort Lauderdale',
  'ft myers': 'Fort Myers',
  'ft. myers': 'Fort Myers',
  'st pete': 'St. Petersburg',
  'st. pete': 'St. Petersburg',
  'st petersburg': 'St. Petersburg',
  'st. petersburg': 'St. Petersburg'
};

// State abbreviations
const stateAbbreviations = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

// Normalize text for comparison
function normalizeText(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

// Load cities from Google Sheets data
function loadCitiesIntoCache(citiesData) {
  knownCitiesCache.clear();
  
  // Expected format: [[city, state], ...]
  for (const row of citiesData) {
    if (row && row.length >= 2) {
      const city = row[0]?.trim();
      const state = row[1]?.trim();
      
      if (city && state) {
        const normalizedCity = normalizeText(city);
        knownCitiesCache.set(normalizedCity, { city, state });
        
        // Also add common variations
        if (city.includes('Saint')) {
          const stVariation = city.replace(/\bSaint\b/g, 'St.');
          knownCitiesCache.set(normalizeText(stVariation), { city, state });
        }
        if (city.includes('St.')) {
          const saintVariation = city.replace(/\bSt\.\b/g, 'Saint');
          knownCitiesCache.set(normalizeText(saintVariation), { city, state });
        }
      }
    }
  }
  
  // Add aliases
  for (const [alias, fullName] of Object.entries(cityAliases)) {
    const normalizedAlias = normalizeText(alias);
    const normalizedFullName = normalizeText(fullName);
    
    // Find the full city info from cache
    const cityInfo = knownCitiesCache.get(normalizedFullName);
    if (cityInfo) {
      knownCitiesCache.set(normalizedAlias, cityInfo);
    }
  }
  
  lastCacheUpdate = Date.now();
  logger.info(`Loaded ${knownCitiesCache.size} city entries into cache (including aliases)`);
}

// Parse location from message
function parseLocation(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }
  
  const normalizedMessage = normalizeText(message);
  const words = normalizedMessage.split(/\s+/);
  
  // Strategy 1: Look for exact city matches (including multi-word cities)
  // Try different word combinations, starting with longer phrases
  for (let length = Math.min(4, words.length); length >= 1; length--) {
    for (let i = 0; i <= words.length - length; i++) {
      const phrase = words.slice(i, i + length).join(' ');
      const cityInfo = knownCitiesCache.get(phrase);
      
      if (cityInfo) {
        logger.debug(`Found exact city match: ${phrase} -> ${cityInfo.city}, ${cityInfo.state}`);
        return cityInfo;
      }
    }
  }
  
  // Strategy 2: Look for "city, state" or "city state" patterns
  const cityStatePattern = /\b([a-z\s]+?)(?:,\s*|\s+)([a-z]{2})\b/gi;
  let match;
  
  while ((match = cityStatePattern.exec(message)) !== null) {
    const potentialCity = match[1].trim();
    const potentialState = match[2].toUpperCase();
    
    if (stateAbbreviations[potentialState]) {
      const normalizedCity = normalizeText(potentialCity);
      const cityInfo = knownCitiesCache.get(normalizedCity);
      
      if (cityInfo && cityInfo.state === stateAbbreviations[potentialState]) {
        logger.debug(`Found city-state pattern match: ${potentialCity}, ${potentialState}`);
        return cityInfo;
      }
    }
  }
  
  // Strategy 3: Look for state abbreviations and check nearby words
  const statePattern = /\b([A-Z]{2})\b/g;
  const upperMessage = message.toUpperCase();
  
  while ((match = statePattern.exec(upperMessage)) !== null) {
    const stateAbbr = match[1];
    const stateName = stateAbbreviations[stateAbbr];
    
    if (stateName) {
      // Check words before the state abbreviation
      const beforeStateIndex = match.index;
      const beforeText = message.substring(Math.max(0, beforeStateIndex - 50), beforeStateIndex);
      const beforeWords = normalizeText(beforeText).split(/\s+/).filter(w => w.length > 0);
      
      // Try different combinations of words before the state
      for (let length = Math.min(3, beforeWords.length); length >= 1; length--) {
        const startIdx = Math.max(0, beforeWords.length - length);
        const potentialCity = beforeWords.slice(startIdx).join(' ');
        const cityInfo = knownCitiesCache.get(potentialCity);
        
        if (cityInfo && cityInfo.state === stateName) {
          logger.debug(`Found city near state abbreviation: ${potentialCity}, ${stateAbbr}`);
          return cityInfo;
        }
      }
    }
  }
  
  return null;
}

// Get cache info
function getCacheInfo() {
  return {
    size: knownCitiesCache.size,
    lastUpdate: lastCacheUpdate,
    ageMs: Date.now() - lastCacheUpdate
  };
}

module.exports = {
  loadCitiesIntoCache,
  parseLocation,
  getCacheInfo
};