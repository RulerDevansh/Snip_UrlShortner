require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');

// Ensure models are loaded so associations are set up
require('./src/models');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const startServer = async () => {
  try {
    // Connect to Redis first (rate limiter depends on it)
    await connectRedis();

    // Connect to MySQL and sync models
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`[Server] ${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled rejection:', err);
  process.exit(1);
});

startServer();
