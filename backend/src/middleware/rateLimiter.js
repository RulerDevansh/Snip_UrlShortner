const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redis } = require('../config/redis');
require('dotenv').config();

/**
 * Build a rate limiter backed by Redis
 */
const createLimiter = ({ windowMs, max, prefix, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    skip: () => process.env.NODE_ENV === 'test',
  });
};

/** Global API limiter: 100 req / 15 min */
const globalLimiter = createLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  prefix: 'global',
  message: 'Too many requests. Please try again later.',
});

/** Strict limiter on the shorten endpoint: 10 req / min */
const shortenLimiter = createLimiter({
  windowMs: parseInt(process.env.SHORTEN_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  max: parseInt(process.env.SHORTEN_RATE_LIMIT_MAX, 10) || 10,
  prefix: 'shorten',
  message: 'Too many shorten requests. Please slow down.',
});

/** Auth limiter: 20 req / 15 min (brute-force protection) */
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  prefix: 'auth',
  message: 'Too many authentication attempts. Please try again later.',
});

module.exports = { globalLimiter, shortenLimiter, authLimiter };
