// Suppress console output during tests unless debugging
if (process.env.NODE_ENV !== 'debug') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DISCORD_TOKEN = 'test-discord-token';
process.env.DISCORD_CHANNEL_ID = 'test-channel-id';
process.env.TWITCH_CHANNEL = 'test-twitch-channel';
process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
process.env.GOOGLE_CREDENTIALS_PATH = './test-credentials.json';

// Mock timers for tests
jest.useFakeTimers();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Restore real timers after all tests
afterAll(() => {
  jest.useRealTimers();
});
