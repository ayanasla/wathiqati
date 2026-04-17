# Wathiqati Production Deployment & Best Practices Guide

## 🚀 Deployment Checklist

### Frontend Deployment (React)

#### 1. **Environment Configuration**

Create `.env.production`:
```env
REACT_APP_API_URL=https://api.yourapp.com/api
REACT_APP_ENV=production
```

#### 2. **Build & Optimization**

```bash
# Build optimized bundle
npm run build

# Analyze bundle size
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'

# Expected bundle size: <500KB (gzipped)
```

#### 3. **Security Hardening**

Add to `public/index.html` headers:
```html
<!-- Prevent clickjacking -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- CSP - Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">

<!-- Prevent MIME sniffing -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">

<!-- Enable XSS protection -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

#### 4. **Deployment Platforms**

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**Traditional Server (nginx)**
```nginx
server {
  listen 80;
  server_name YOUR_DOMAIN;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name YOUR_DOMAIN;

  ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  root /var/www/wathiqati/build;
  index index.html;

  # SPA routing: serve index.html for all non-file requests
  location / {
    try_files $uri /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

---

### Backend Deployment (Node.js + Express)

#### 1. **Environment Configuration**

Create `.env.production`:
```env
NODE_ENV=production
PORT=5001
DATABASE_URL=mysql://user:password@prod-db.example.com:3306/wathiqati
JWT_SECRET=your-long-random-secret-key-min-32-chars
CORS_ORIGIN=https://yourapp.com
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn-url
```

#### 2. **Database Setup**

```bash
# Use MySQL for production (not SQLite)
npm install mysql2 sequelize

# Run migrations
npm run migrate:prod

# Create backups
mysqldump -u user -p database_name > backup.sql
```

#### 3. **Process Management**

Use PM2 or similar:

```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'wathiqati-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true,
    max_memory_restart: '500M',
  }],
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. **SSL/TLS Certificate**

```bash
# Use Let's Encrypt (free)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d api.yourapp.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### 5. **Rate Limiting & DDoS Protection**

Add to backend `server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redis.createClient({ host: 'localhost', port: 6379 }),
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use(limiter);
```

#### 6. **Logging & Monitoring**

```javascript
// backend/utils/logger.js - Already exists, enhance it
const winston = require('winston');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

module.exports = logger;
```

---

## 🔐 Security Best Practices

### 1. **Authentication & Tokens**

✅ **DO:**
- Use HTTPS only (enforce with HSTS header)
- Store JWT in httpOnly cookies (not localStorage)
- Set token expiration to 15-30 minutes
- Implement refresh tokens for longer sessions
- Use strong JWT secrets (min 32 characters)
- Validate token signature on every request

❌ **DON'T:**
- Send tokens in URL parameters
- Store sensitive data in JWT payload  
- Log tokens or sensitive data
- Hardcode secrets in code

### 2. **CORS Configuration**

Update `backend/server.js`:
```javascript
const cors = require('cors');

const allowedOrigins = [
  'https://yourapp.com',
  'https://www.yourapp.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 3. **Input Validation & Sanitization**

```javascript
// Add to validationMiddleware.js
const { body, validationResult } = require('express-validator');

export const validateRequest = [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
```

### 4. **SQL Injection Prevention**

✅ Already using Sequelize (ORM) - which prevents SQL injection
✅ Always use parameterized queries

### 5. **XSS Prevention**

```javascript
// Add helmet middleware to backend
const helmet = require('helmet');
app.use(helmet());
```

### 6. **File Upload Security**

```javascript
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: './uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});
```

### 7. **API Response Security**

Prevent information leakage:
```javascript
// Don't expose stack traces in production
app.use((err, req, res, next) => {
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});
```

---

## 📊 Performance Optimization

### Frontend

```javascript
// Use React.lazy for code splitting
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Wrap in Suspense
import { Suspense } from 'react';
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Backend

```javascript
// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  next();
});

// Use pagination (already in Pagination.jsx)
app.get('/api/requests', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  // Query with LIMIT and OFFSET
});
```

---

## 🧪 Testing Before Production

```bash
# Run all tests
npm test

# E2E testing
npm install -D cypress
npx cypress run

# Performance testing
npm install -D lighthouse
npm run lighthouse

# Load testing
npm install -D k6
k6 run load-test.js
```

---

## 📋 Post-Deployment Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Database backups configured (daily)
- [ ] Monitoring alerts set up (Sentry, uptime monitoring)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Logging is working (check logs directory)
- [ ] Security headers verified (Security Headers website)
- [ ] Email notifications configured (for errors/alerts)
- [ ] Database connection using password manager/env vars
- [ ] Frontend .env.production configured
- [ ] Backend .env.production configured
- [ ] Admin user created for production
- [ ] Test complete user flow (register → login → create request → admin approval)
- [ ] Verify API routes work with production domain
- [ ] Create runbook for common issues

---

## 🔧 Production Troubleshooting

**Issue: API returns 401 on all requests**
- Check JWT_SECRET matches frontend and backend
- Verify token is being sent in Authorization header
- Check token hasn't expired

**Issue: CORS errors**
- Verify frontend domain is in CORS_ORIGIN allowlist
- Check credentials:true is set on both sides

**Issue: Database connection fails**
- Verify DATABASE_URL format
- Check MySQL credentials and port
- Test connection: `mysql -u user -p -h host db_name`

**Issue: Slow requests**
- Enable database query logging
- Add indexes on frequently queried columns
- Check server memory/CPU usage

---

## 📚 Additional Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security](https://react.dev/learn/security)

Generated: {{ date }}
Last Updated: Production v1.0
