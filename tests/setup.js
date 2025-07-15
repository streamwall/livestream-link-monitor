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
process.env.STREAMSOURCE_API_URL = 'http://localhost:3000';
process.env.STREAMSOURCE_EMAIL = 'test@example.com';
process.env.STREAMSOURCE_PASSWORD = 'test-password';

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
