# DEPLOYMENT GUIDE

## Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database backups setup
- [ ] SSL certificates ready
- [ ] Domain pointing to server
- [ ] Database created and migrated

## Backend Deployment (Render)

### 1. Prepare Backend

```bash
# Create a production-ready .env file
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host.com
DB_USER=your-db-user
DB_PASSWORD=your-strong-password
DB_NAME=wathiqati_prod
JWT_SECRET=your-very-long-random-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

### 2. Setup Render

- Create new Web Service on Render
- Connect GitHub repository
- Set runtime: Node
- Set build command: `cd backend && npm install`
- Set start command: `cd backend && node server.js`
- Add environment variables
- Deploy

### 3. Database Setup

```bash
# SSH into server
# Create MySQL database
mysql -u root -p

# Run initialization
node initdb.js
```

## Frontend Deployment (Vercel/Netlify)

### 1. Build Frontend

```bash
cd mon-portail-administratif
npm run build
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Configure Environment

Add in Vercel project settings:
```
REACT_APP_API_URL=https://your-backend-url/api
```

### 4. Deployment in vercel.json

```json
{
  "env": {
    "REACT_APP_API_URL": "@api_url"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "build"
}
```

## Domain Configuration

### Update Your Domain

1. Point DNS records to hosting provider
2. Configure SSL certificate
3. Update API URL in frontend

### Environment Variables Update

Backend .env:
```
CORS_ORIGIN=https://yourdomain.com
```

Frontend:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Database Migration

### 1. Export Data (if migrating)

```bash
mysqldump -u root -p wathiqati_db > backup.sql
```

### 2. Import to Production

```bash
mysql -u user -p wathiqati_prod < backup.sql
```

### 3. Update Connection

Update .env with production credentials

## Monitoring & Logging

### Backend Logs

- Render: Dashboard > Logs tab
- Check application errors
- Monitor performance metrics

### Database Monitoring

- Monitor query performance
- Setup automated backups
- Alert on connection issues

## SSL/HTTPS

### Render (Automatic)

- Render automatically provisions SSL
- Renews automatically
- No configuration needed

### Custom Domain with Cloudflare

1. Add domain to DNS provider
2. Setup Cloudflare (optional)
3. Enable SSL in Cloudflare settings
4. Update backend CORS

## Scaling

### Database Optimization

- Add indexes to frequently queried columns
- Archive old data regularly
- Monitor connection pool

### Backend Optimization

- Enable compression
- Cache static assets
- Use CDN for uploads

### Frontend Optimization

- Code splitting with React.lazy
- Image optimization
- Minification (done by build)

## Backup Strategy

### Automated Backups

```bash
# MySQL backup script (cron job)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u user -p password wathiqati_prod > /backups/wathiqati_$DATE.sql
```

### Keep Backups

- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

## Health Checks

### Monitor Endpoints

```bash
# Check backend health
curl https://api.yourdomain.com/ping

# Check database connection
# Add health check endpoint to backend
```

### Alert Setup

- Setup uptime monitoring (UptimeRobot, etc.)
- Email alerts for failures
- Automated recovery attempts

## Rollback Procedure

### If Deployment Fails

1. Keep previous version deployed
2. Restore from Git tag
3. Revert database if needed
4. Test before republishing

### Version Control

```bash
# Tag releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

## Performance Tuning

### Backend Optimization

- Add response compression
- Implement caching
- Optimize database queries
- Use connection pooling

### Frontend Optimization

- Lazy load components
- Code splitting
- Image optimization
- CSS purging

## Security Hardening

### API Security

- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention (Sequelize ORM)

### Data Security

- Encryption in transit (SSL)
- Encryption at rest (database)
- Regular security audits
- Dependency updates

## Monitoring Tools

Recommended services:
- **Application Monitoring**: Sentry, New Relic
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Database Monitoring**: MySQL Enterprise Monitor
- **Analytics**: Google Analytics

## Support & Maintenance

- Monitor error rates daily
- Review logs weekly
- Update dependencies monthly
- Security patches immediately
- Plan scaling quarterly

## Emergency Contacts

- Primary Developer: [contact]
- DevOps Team: [contact]
- Infrastructure Support: [host support]

---

**Last Updated**: March 2026
**Maintained By**: Development Team
