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
    this.requests.delete(key);
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
    }
  }
}

module.exports = RateLimiter;