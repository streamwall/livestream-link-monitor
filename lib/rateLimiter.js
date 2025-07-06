class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.maxRequests = options.maxRequests || 10;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      this.requests.set(key, validRequests);
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key) {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }

  resetAll() {
    this.requests.clear();
  }

  // Clean up old entries periodically
  startCleanup(intervalMs = 60000) {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, times] of this.requests.entries()) {
        const validTimes = times.filter(time => now - time < this.windowMs);
        if (validTimes.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validTimes);
        }
      }
    }, intervalMs);
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, times] of this.requests.entries()) {
      const validTimes = times.filter(time => now - time < this.windowMs);
      if (validTimes.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimes);
      }
    }
  }
}

function createRateLimiter(options) {
  const limiter = new RateLimiter(options);
  return {
    check: (key) => limiter.isAllowed(key),
    cleanup: () => limiter.cleanup()
  };
}

module.exports = RateLimiter;
module.exports.createRateLimiter = createRateLimiter;
module.exports.RateLimiter = RateLimiter;