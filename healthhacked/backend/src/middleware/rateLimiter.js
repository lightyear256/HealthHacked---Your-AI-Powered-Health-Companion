
const rateLimit = require('express-rate-limit');

// Chat-specific rate limiter (more restrictive)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: {
    error: 'Too many chat messages, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true,
});

module.exports = {
  chatLimiter,
  authLimiter
};
