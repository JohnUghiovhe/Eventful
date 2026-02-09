# Deploying Eventful on Render

This guide will walk you through deploying the complete Eventful application (backend + frontend) on Render.

## Prerequisites

- [Render account](https://render.com) (free tier available)
- [GitHub repository](https://github.com) with your Eventful code
- MongoDB Atlas account (recommended for managed database)
- Redis (Render provides Redis or use managed service)
- Paystack account (for payment processing)

## Step 1: Prepare Your Code for Deployment

### 1.1 Update Environment Variables

Create/verify `.env.production` file in the root:
```env
NODE_ENV=production
PORT=10000

# MongoDB - Use MongoDB Atlas URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventful?retryWrites=true&w=majority

# Redis - Use Render Redis or external service
REDIS_URL=redis://your-redis-url:port

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=pk_live_xxxxxxxxxxxxx

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=https://eventful-frontend.onrender.com
API_BASE_URL=https://eventful-api.onrender.com/api
```

### 1.2 Update Build Scripts

Ensure `package.json` has proper build scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "db:cleanup": "ts-node src/scripts/dbCleanup.ts"
  }
}
```

### 1.3 Frontend Configuration

Create `frontend/.env.production`:
```env
VITE_API_URL=https://eventful-api.onrender.com/api
```

Update `frontend/vite.config.ts` with Render domain (already configured):
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://eventful-api.onrender.com',
        changeOrigin: true
      }
    }
  }
});
```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add a database user with strong password
4. Whitelist Render IP or allow all IPs (0.0.0.0/0)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/eventful?retryWrites=true&w=majority`

## Step 3: Create Backend Service on Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Click "New" → "Web Service"**

3. **Connect your GitHub repository**
   - Select your repository
   - Choose branch (e.g., main)

4. **Configure Build Settings**
   - **Name**: `eventful-api`
   - **Environment**: `Node`
   - **Region**: Select closest to your users (e.g., Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. **Set Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add all variables from your `.env.production` file:
     - `NODE_ENV=production`
     - `MONGODB_URI=mongodb+srv://...`
     - `REDIS_URL=...`
     - `JWT_SECRET=...`
     - `PAYSTACK_SECRET_KEY=...`
     - etc.

6. **Choose Plan**
   - Select "Free" tier or paid tier
   - Note: Free tier spins down after 15 minutes of inactivity

7. **Create Web Service**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Note your backend URL: `https://eventful-api.onrender.com`

## Step 4: Create Redis Instance

### Option A: Render Redis (Recommended)

1. **Go to Render Dashboard**
2. **Click "New" → "Redis"**
3. **Configure**
   - **Name**: `eventful-redis`
   - **Region**: Same as your backend
   - **Plan**: Free tier available
4. **Create**
5. Copy the connection URL and add to backend env variables as `REDIS_URL`

### Option B: External Redis Service

Use [Redis Labs](https://redis.com/try-free/) or similar managed service and get their connection URL.

## Step 5: Create Frontend Service on Render

1. **Go to Render Dashboard**
2. **Click "New" → "Static Site"**
3. **Connect GitHub Repository**
4. **Configure Build Settings**
   - **Name**: `eventful-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment**: Select "Node"
   - **Branch**: `main`

5. **Set Environment Variables**
   - `VITE_API_URL=https://eventful-api.onrender.com/api`

6. **Create Static Site**
   - Wait for build to complete
   - Note your frontend URL: `https://eventful-frontend.onrender.com`

7. **Add SPA Rewrite Rule**
   - In Render Static Site settings, add a Redirect/Rewrites rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`
   - This prevents 404s on routes like `/payment/verify` after Paystack redirects

## Step 6: Update Backend with Frontend URL

1. Go back to backend service settings
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://eventful-frontend.onrender.com
   ```
3. Trigger a redeploy

## Step 7: Configure CORS

Update backend `src/index.ts` CORS configuration:
```typescript
app.use(cors({
  origin: [
    'https://eventful-frontend.onrender.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));
```

Redeploy backend after changes.

## Step 8: Verify Deployment

### Check Backend
1. Visit `https://eventful-api.onrender.com/api/health` or similar endpoint
2. Verify database connection
3. Check logs in Render dashboard

### Check Frontend
1. Visit `https://eventful-frontend.onrender.com`
2. Test user registration
3. Test event creation (Creator role)
4. Test payment flow

### Common Issues & Solutions

**Issue**: Build fails with "Cannot find module"
- **Solution**: Ensure all dependencies are in `package.json` (not global)
- Run `npm install` locally and commit `package-lock.json`

**Issue**: Frontend can't reach backend API
- **Solution**: Check `VITE_API_BASE_URL` environment variable
- Verify CORS configuration in backend
- Check `/api` proxy configuration in Vite

**Issue**: Database connection timeout
- **Solution**: Whitelist Render IPs in MongoDB Atlas
- Or allow all IPs (0.0.0.0/0) - consider security implications
- Verify connection string is correct

**Issue**: Free tier keeps spinning down
- **Solution**: Upgrade to paid tier ($7/month)
- Or use a cron job service to keep it active
- Consider using Koyeb or Railway as alternatives

## Step 9: Trigger Clean Rebuild on Render

If you encounter TypeScript compile errors during deployment:

1. **In Render Backend Service:**
   - Go to Settings tab
   - Click "Clear Build Cache"
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete

2. **Locally, ensure clean git state:**
   ```bash
   git add .
   git commit -m "Clean build - remove old files"
   git push origin main
   ```

3. **If errors persist:**
   - Check your local files match:
     - Controllers: `src/controllers/*.controller.ts` ✓
     - Routes: `src/routes/*.routes.ts` ✓
     - Services: `src/services/*.service.ts` ✓
   - Ensure imports use:
     - `import { Logger } from '../utils/logger'` (NOT default export)
     - `import { AuthRequest } from '../types'` (NOT AuthenticatedRequest)
     - `import { authenticate, isCreator, isEventee } from '../middleware/auth'`

## Step 10: Set Up Automatic Deployments

1. **Go to Backend Service → Settings**
2. **Enable Auto-Deploy**
   - Select branch (main)
   - Redeploy on push: ON

3. **Do the same for Frontend**

Now every push to main branch will automatically redeploy!

## Step 10: Database Initialization

After first deployment:

1. **Run seed script** (one-time setup)
   ```bash
   # Via Render dashboard shell or locally with production DB
   npm run db:cleanup
   ```

2. **Create initial test data**
   - This happens automatically on startup via `seedEvents()` in `src/index.ts`

## Monitoring & Maintenance

### View Logs
1. Go to service dashboard
2. Click "Logs" tab
3. Monitor for errors and issues

### Performance Monitoring
- Check Render dashboard metrics
- Monitor Redis usage
- Monitor MongoDB Atlas metrics

### Scheduled Tasks
- **Database cleanup**: Scripts in `src/scripts/` run as needed
- **Email reminders**: Scheduled via `NotificationService.startScheduler()`

## Cost Estimates (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Backend API | Standard (0.5 vCPU) | $12.50 |
| Frontend Static | Free | $0 |
| Redis | Free | $0 (paid: $5) |
| MongoDB Atlas | Free tier | $0 (paid: varies) |
| **Total** | **Recommended** | **$12.50+** |

**Note**: Free tier services may have performance limitations. Upgrade as your user base grows.

## Troubleshooting

### Logs show "Cannot connect to MongoDB"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure credentials are URL-encoded

### Redis connection errors
- Verify `REDIS_URL` format
- Ensure Redis and backend are in the same region (recommended)
- Test connection locally first

### Payment verification failing
- Verify `PAYSTACK_SECRET_KEY` is set correctly
- Check Paystack account is live (not test mode)
- Ensure `FRONTEND_URL` callback matches

### Emails not sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail: Use app-specific password, not account password
- Enable "Less secure app access" if using Gmail
- Check spam folder for test emails

## Security Best Practices

1. **Never commit `.env` files** - Use environment variables in Render
2. **Use strong JWT_SECRET** - At least 32 characters, random
3. **Enable HTTPS** - Render does this automatically
4. **Keep dependencies updated** - Regularly update packages
5. **Use MongoDB IP whitelist** - Restrict access to Render IPs
6. **Rotate Paystack keys** - Regularly update API keys
7. **Monitor logs** - Set up alerts for errors
8. **Backup database** - Use MongoDB Atlas automated backups

## Performance Optimization Tips

1. **Enable Redis caching** - Reduces database queries
2. **Use database indexes** - Already configured in models
3. **Implement pagination** - API endpoints support limit/skip
4. **Compress assets** - Vite does this by default
5. **CDN for images** - Consider CloudFlare or similar

## Next Steps

- Set up error monitoring (e.g., Sentry)
- Configure automated backups
- Set up CI/CD pipeline
- Monitor performance metrics
- Scale resources as needed

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Guide](https://docs.mongodb.com/atlas/)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Deployment](https://react.dev/learn/start-a-new-react-project)

---

**Happy Deploying! 🚀**
