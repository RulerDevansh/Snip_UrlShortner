const { redis } = require('../config/redis');

const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
const CACHE_PREFIX = 'short:';

/**
 * Get the original URL for a short code from Redis cache
 * @returns {string|null} original URL or null if cache miss
 */
const getCachedUrl = async (shortCode) => {
  const key = `${CACHE_PREFIX}${shortCode}`;
  return redis.get(key);
};

/**
 * Cache a short_code → original_url mapping
 */
const setCachedUrl = async (shortCode, originalUrl, ttl = CACHE_TTL) => {
  const key = `${CACHE_PREFIX}${shortCode}`;
  await redis.set(key, originalUrl, 'EX', ttl);
};

/**
 * Invalidate a cached short code (on delete)
 */
const invalidateCachedUrl = async (shortCode) => {
  const key = `${CACHE_PREFIX}${shortCode}`;
  await redis.del(key);
};

module.exports = { getCachedUrl, setCachedUrl, invalidateCachedUrl };
