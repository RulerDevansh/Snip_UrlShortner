# Snip — Production-Grade URL Shortener

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack url shortener built with React, Node.js/Express, MySQL, and Redis — featuring JWT + Google OAuth authentication, custom aliases, click analytics, Redis caching for sub-millisecond redirects, and Redis-backed rate limiting. Fully containerised with Docker Compose and deployable to AWS EC2.

---

## Screenshots

> _Add screenshots here after deployment_

| Home | Dashboard | Login |
|------|-----------|-------|
| ![Home](docs/home.png) | ![Dashboard](docs/dashboard.png) | ![Login](docs/login.png) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client  (React + Vite)                    │
│   React Router v6 │ TailwindCSS │ Axios │ AuthContext       │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP (port 80 in prod)
┌──────────────────────────▼──────────────────────────────────┐
│              Nginx (production reverse proxy)                │
│  /api/* → backend:3000  │  /auth/* → backend:3000           │
│  /r/*   → backend:3000  │  /*      → React SPA (index.html) │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Backend  (Node.js + Express)                     │
│  Helmet │ CORS │ Morgan │ Passport │ Rate Limiting (Redis)   │
│  Zod Validation │ JWT Auth │ Google OAuth 2.0               │
└──────┬────────────────────────────┬───────────────────────── ┘
       │                            │
┌──────▼──────┐            ┌────────▼──────┐
│   MySQL 8   │            │   Redis 7     │
│  Sequelize  │            │  Cache + RL   │
│  users      │            │  short:CODE   │
│  links      │            │  rl:*:*       │
│  clicks     │            └───────────────┘
└─────────────┘
```

### Caching Strategy

```
GET /r/:shortCode
        │
        ▼
  ┌─────────────┐     HIT      ┌──────────────┐
  │ Redis Cache │ ──────────►  │ 301 Redirect │
  └─────────────┘              └──────────────┘
        │ MISS
        ▼
  ┌─────────────┐              ┌──────────────┐
  │   MySQL DB  │ ──────────►  │ 301 Redirect │
  └─────────────┘              └──────────────┘
        │
        ▼ (async, fire-and-forget)
  ┌─────────────────────────────┐
  │  Redis SET short:CODE TTL   │
  │  link.click_count++         │
  │  clicks.INSERT(...)         │
  └─────────────────────────────┘
```

On cache miss, MySQL is queried, the result is cached in Redis with a 24-hour TTL, and the click is recorded asynchronously without blocking the redirect response.

---

## Features

- 🔗 **URL Shortening** — 6-character nanoid short codes using an unambiguous alphabet
- ✏️ **Custom Aliases** — user-defined slugs (`/r/my-brand`)
- 📊 **Click Analytics** — total click count + last 10 clicks with IP, user agent, referrer
- 🔐 **JWT Authentication** — email/password login with bcrypt hashing
- 🔑 **Google OAuth 2.0** — one-click sign-in via Passport.js
- ⚡ **Redis Caching** — sub-millisecond redirects after first lookup
- 🛡️ **Rate Limiting** — Redis-backed, per-endpoint limits
- 🐳 **Docker Compose** — dev + production configurations
- ☁️ **AWS EC2 Deploy** — automated deploy script

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TailwindCSS 3, React Router 6 |
| Backend | Node.js 20, Express 4 |
| Database | MySQL 8 (Sequelize ORM) |
| Cache / Rate limit | Redis 7 (ioredis) |
| Auth | JWT (jsonwebtoken), Google OAuth (Passport.js) |
| Validation | Zod |
| Container | Docker, Docker Compose |
| Web server | Nginx 1.27 (production) |
| Cloud | AWS EC2, AWS CLI |

---

## Project Structure

```
URL_Shortner/
├── backend/
│   ├── src/
│   │   ├── config/         # database.js, redis.js, passport.js
│   │   ├── models/         # User, Link, Click (Sequelize)
│   │   ├── middleware/     # auth, rateLimiter, errorHandler, validate
│   │   ├── validators/     # Zod schemas
│   │   ├── controllers/    # authController, linkController, redirectController
│   │   ├── routes/         # authRoutes, linkRoutes, redirectRoutes
│   │   ├── services/       # cacheService (Redis)
│   │   └── utils/          # generateCode (nanoid), jwt
│   ├── app.js              # Express app setup
│   ├── server.js           # Entry point
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, ShortenForm, LinkCard, AuthGuard, Toast, Loader
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── pages/          # Home, Login, Register, Dashboard, OAuthCallback, NotFound
│   │   ├── services/       # api.js (axios), authService, linkService
│   │   └── utils/          # helpers.js
│   ├── nginx.conf          # Production Nginx config
│   └── Dockerfile          # Multi-stage build
├── deploy/
│   └── aws-deploy.sh       # EC2 deployment automation
├── docker-compose.yml      # Development
└── docker-compose.prod.yml # Production
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register with email + password |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| GET | `/auth/google` | ✗ | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | ✗ | Google OAuth callback |

### Links

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/links` | JWT | Create a short link |
| GET | `/api/links` | JWT | List all user's links |
| DELETE | `/api/links/:id` | JWT | Delete a link |
| GET | `/api/links/:id/stats` | JWT | Get link analytics |

### Redirect

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/r/:shortCode` | ✗ | Redirect to original URL |

### Request / Response Examples

**POST `/api/auth/register`**
```json
// Request
{ "name": "Jane", "email": "jane@example.com", "password": "Secure123!" }

// Response 201
{ "success": true, "data": { "token": "eyJ...", "user": { "id": "...", "name": "Jane", "email": "jane@example.com" } } }
```

**POST `/api/links`**
```json
// Request
{ "original_url": "https://very-long-url.com/path?query=value", "custom_alias": "my-link" }

// Response 201
{ "success": true, "data": { "link": { "short_url": "http://localhost:3000/r/my-link", "short_code": "my-link", "click_count": 0, ... } } }
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `mysql` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `url_shortener` |
| `DB_USER` | MySQL user | `url_user` |
| `DB_PASSWORD` | MySQL password | `secure_pass` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | `redis_pass` |
| `JWT_SECRET` | JWT signing secret | `long_random_string` |
| `JWT_EXPIRES_IN` | Token TTL | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | from GCP Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | from GCP Console |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `https://yourdomain.com/auth/google/callback` |
| `BASE_URL` | Base URL for short links | `https://yourdomain.com` |
| `FRONTEND_URL` | Frontend origin (CORS) | `https://yourdomain.com` |
| `RATE_LIMIT_WINDOW_MS` | Global rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Global rate limit max | `100` |
| `SHORTEN_RATE_LIMIT_MAX` | Shorten endpoint max | `10` |

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Clone

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values (Google OAuth credentials, JWT secret)
```

### 3. Start with Docker Compose (recommended)

```bash
docker compose up --build
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MySQL: localhost:3306
- Redis: localhost:6379

### 4. Or run manually (without Docker)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

> Ensure MySQL and Redis are running locally and update `backend/.env` with `DB_HOST=localhost` and `REDIS_HOST=localhost`.

---

## Docker Setup

### Development

```bash
# Start all services with hot reload
docker compose up --build

# Stop
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Production Build

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up --build -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → OAuth consent screen**
   - User type: External
   - Fill in app name, support email
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorised redirect URIs: `http://localhost:3000/auth/google/callback` (dev) and `https://yourdomain.com/auth/google/callback` (prod)
5. Copy Client ID and Client Secret to `backend/.env`

---

## AWS EC2 Deployment

### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- An EC2 key pair (`.pem` file)
- Your project pushed to a Git repository

### Deploy

```bash
# Set required environment variables
export KEY_NAME="your-key-pair-name"        # EC2 key pair name (without .pem)
export REPO_URL="https://github.com/you/snip.git"
export AWS_REGION="us-east-1"               # optional, defaults to us-east-1
export INSTANCE_TYPE="t3.small"             # optional

# Make script executable
chmod +x deploy/aws-deploy.sh

# Run deployment
./deploy/aws-deploy.sh
```

The script will:
1. Resolve the latest Amazon Linux 2023 AMI
2. Create a security group (ports 22, 80, 443)
3. Launch a t3.small instance with Docker pre-installed
4. Wait for SSH availability
5. Clone your repo and start production containers

### After deployment

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<PUBLIC_IP>

# Edit environment with your real secrets
nano /home/ec2-user/snip/backend/.env

# Restart services
cd /home/ec2-user/snip
docker compose -f docker-compose.prod.yml restart
```

### HTTPS with Let's Encrypt (recommended for production)

```bash
# On the EC2 instance
sudo dnf install -y nginx certbot python3-certbot-nginx

# Configure your domain to point to the EC2 public IP in your DNS provider
# Then obtain a certificate:
sudo certbot --nginx -d yourdomain.com
```

---

## Scalability & Caching Explanation

### Redis Caching

- **Key pattern**: `short:{shortCode}` → original URL
- **TTL**: 24 hours (automatically refreshed on access is not implemented — lazy expiry)
- **Eviction policy**: `allkeys-lru` — Redis evicts least-recently-used keys under memory pressure
- **Cache invalidation**: Explicit `DEL short:{shortCode}` on link deletion

**Result**: After the first redirect (cache miss + MySQL query), all subsequent redirects for the same code are served entirely from Redis — typically < 2ms.

### Rate Limiting

Three tiers backed by Redis (distributed — works across multiple backend instances):

| Limiter | Window | Max | Scope |
|---------|--------|-----|-------|
| Global | 15 min | 100 req | All `/api/*` routes |
| Shorten | 1 min | 10 req | `POST /api/links` |
| Auth | 15 min | 20 req | `POST /api/auth/*` |

### Horizontal Scaling

The backend is stateless — all state lives in MySQL and Redis. To scale:

1. Run multiple backend containers behind a load balancer
2. Point all instances to the same MySQL and Redis
3. Rate limiting automatically works across all instances (Redis store)
4. Cache hits are shared across instances

```
Load Balancer (e.g. AWS ALB)
    ├── backend-1:3000
    ├── backend-2:3000
    └── backend-3:3000
            │
    ┌───────┴────────┐
    │  MySQL (RDS)   │  Redis (ElastiCache)
    └────────────────┘
```

---

