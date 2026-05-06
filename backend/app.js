require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./src/config/passport');
const { globalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const linkRoutes = require('./src/routes/linkRoutes');
const redirectRoutes = require('./src/routes/redirectRoutes');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.set('trust proxy', 1); // trust first proxy (nginx / load balancer)
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Logging ─────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Passport (OAuth) ────────────────────────────────────────
app.use(passport.initialize());

// ─── Rate limiting (global) ──────────────────────────────────
app.use('/api', globalLimiter);

// ─── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/r', redirectRoutes);

// ─── Error handling ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
