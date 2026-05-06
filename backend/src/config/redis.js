const Redis = require('ioredis');
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 100, 3000);
  },
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redis = new Redis(redisConfig);

redis.on('connect', () => console.log('[Redis] Connected successfully.'));
redis.on('error', (err) => console.error('[Redis] Connection error:', err.message));
redis.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

const connectRedis = async () => {
  if (redis.status === 'wait' || redis.status === 'close') {
    await redis.connect();
  }
};

module.exports = { redis, connectRedis };
