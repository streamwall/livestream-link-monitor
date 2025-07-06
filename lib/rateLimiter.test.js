const { createRateLimiter } = require('./rateLimiter');
const RateLimiter = require('./rateLimiter').RateLimiter || require('./rateLimiter');

describe('createRateLimiter', () => {
  it('should create a RateLimiter instance with check method', () => {
    const limiter = createRateLimiter({
      windowMs: 5000,
      maxRequests: 2
    });

    expect(limiter).toBeDefined();
    expect(typeof limiter.check).toBe('function');
    
    // Test the check method
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false); // Third request should fail
  });

  it('should use default config when no options provided', () => {
    const limiter = createRateLimiter();
    expect(limiter).toBeDefined();
    expect(limiter.check('user')).toBe(true);
  });

  it('should expose cleanup method', () => {
    const limiter = createRateLimiter();
    expect(typeof limiter.cleanup).toBe('function');
    
    // Test cleanup functionality
    limiter.check('user1');
    limiter.check('user2');
    limiter.cleanup();
    
    // Should not throw
    expect(() => limiter.cleanup()).not.toThrow();
  });
});

describe('RateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 3
    });
  });

  afterEach(() => {
    rateLimiter.stopCleanup();
    jest.clearAllTimers();
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(rateLimiter.windowMs).toBe(60000);
      expect(rateLimiter.maxRequests).toBe(3);
    });

    it('should use default values when options not provided', () => {
      const defaultLimiter = new RateLimiter({});
      expect(defaultLimiter.windowMs).toBe(60000);
      expect(defaultLimiter.maxRequests).toBe(10);
    });
  });

  describe('isAllowed', () => {
    it('should allow first request', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should allow requests up to maxRequests', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests after maxRequests', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should track different users separately', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });

    it('should allow requests after time window expires', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.isAllowed('user1')).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(60001);
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      
      expect(rateLimiter.requests.size).toBe(2);

      // Advance time past the window
      jest.advanceTimersByTime(60001);
      
      rateLimiter.cleanup();
      expect(rateLimiter.requests.size).toBe(0);
    });

    it('should keep non-expired entries', () => {
      rateLimiter.isAllowed('user1');
      
      jest.advanceTimersByTime(30000); // Half the window
      rateLimiter.isAllowed('user2');
      
      jest.advanceTimersByTime(31000); // user1 should expire, user2 should not
      
      rateLimiter.cleanup();
      expect(rateLimiter.requests.size).toBe(1);
      expect(rateLimiter.requests.has('user2')).toBe(true);
    });
  });

  describe('startCleanup and stopCleanup', () => {
    it('should start periodic cleanup', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      
      expect(rateLimiter.requests.size).toBe(2);
      
      rateLimiter.startCleanup(1000); // 1 second interval
      
      // Advance time to trigger cleanup
      jest.advanceTimersByTime(61000); // Past the window
      jest.advanceTimersByTime(1000); // Trigger cleanup
      
      expect(rateLimiter.requests.size).toBe(0);
    });

    it('should stop periodic cleanup', () => {
      rateLimiter.startCleanup(1000);
      expect(rateLimiter.cleanupInterval).toBeDefined();
      
      rateLimiter.stopCleanup();
      expect(rateLimiter.cleanupInterval).toBeUndefined();
    });

    it('should handle multiple start calls', () => {
      rateLimiter.startCleanup(1000);
      const firstInterval = rateLimiter.cleanupInterval;
      
      rateLimiter.startCleanup(2000);
      const secondInterval = rateLimiter.cleanupInterval;
      
      expect(firstInterval).not.toBe(secondInterval);
    });

    it('should use default interval when not specified', () => {
      rateLimiter.startCleanup(); // Should use default 60000ms
      expect(rateLimiter.cleanupInterval).toBeDefined();
      rateLimiter.stopCleanup();
    });
  });

  describe('reset method', () => {
    it('should reset specific user when called with key', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      rateLimiter.isAllowed('user3');
      
      expect(rateLimiter.requests.size).toBe(3);
      
      // Reset specific user
      rateLimiter.reset('user2');
      expect(rateLimiter.requests.size).toBe(2);
      expect(rateLimiter.requests.has('user1')).toBe(true);
      expect(rateLimiter.requests.has('user2')).toBe(false);
      expect(rateLimiter.requests.has('user3')).toBe(true);
    });

    it('should handle reset of non-existent user', () => {
      rateLimiter.isAllowed('user1');
      
      expect(rateLimiter.requests.size).toBe(1);
      
      rateLimiter.reset('nonexistent');
      expect(rateLimiter.requests.size).toBe(1);
      expect(rateLimiter.requests.has('user1')).toBe(true);
    });

    it('should handle reset without key (clear all)', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      
      expect(rateLimiter.requests.size).toBe(2);
      
      // This might clear all if reset() is overloaded
      rateLimiter.reset();
      expect(rateLimiter.requests.size).toBe(0);
    });
  });

  describe('resetAll', () => {
    it('should clear all requests', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user2');
      rateLimiter.isAllowed('user3');
      
      expect(rateLimiter.requests.size).toBe(3);
      
      rateLimiter.resetAll();
      expect(rateLimiter.requests.size).toBe(0);
    });
  });
});