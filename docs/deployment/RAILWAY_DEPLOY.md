# Railway Deployment - Step-by-Step Guide

Your `railway.json` is already configured! Follow these steps:

## Prerequisites

1. **Create Railway Account**
   - Go to: https://railway.app
   - Sign up (GitHub recommended)

2. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **Login to Railway**
   ```bash
   railway login
   ```
   - Opens browser to authenticate
   - Returns to terminal when done

## Deployment Steps

### Option A: Auto-Deploy from Web Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account
   - Select your repository

3. **Configure Services**
   - Railway auto-detects your `railway.json`
   - Automatically creates:
     - PostgreSQL database
     - Backend service (from `backend/Dockerfile`)
     - Frontend service (from `frontend/Dockerfile`)

4. **Set Environment Variables**
   - Click each service → Variables
   - Add these to `backend` service:
     ```
     SECRET_KEY=<generate: openssl rand -hex 32>
     STRIPE_SECRET_KEY=sk_live_xxxxx
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 3-5 minutes
   - View logs in real-time

### Option B: CLI Deploy (Faster if you know Railway)

1. **Initialize Project**
   ```bash
   railway init
   ```
   - Select "Create new project"
   - Enter project name

2. **Link GitHub (if not auto-detected)**
   ```bash
   railway link
   ```

3. **Deploy**
   ```bash
   railway up
   ```
   - Reads `railway.json`
   - Deploys all services automatically

4. **Monitor**
   ```bash
   railway logs backend
   railway logs db
   railway logs frontend
   ```

## Expected Result

After deployment:

```
✅ PostgreSQL 15 running (managed database)
✅ Backend (FastAPI) running on https://saas-backend-prod.up.railway.app
✅ Frontend (React) running on https://saas-frontend-prod.up.railway.app
```

## Post-Deployment Testing

```bash
# Test backend API
curl https://saas-backend-prod.up.railway.app/docs

# Test frontend
open https://saas-frontend-prod.up.railway.app

# View real-time logs
railway logs -f
```

## Environment Variables Auto-Set by Railway

These are automatically injected by Railway from `railway.json`:

```
DATABASE_URL = postgresql://user:password@host:5432/saas_db
VITE_API_URL = https://your-backend-domain
```

You still need to add:
- SECRET_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

## Troubleshooting

### Deployment stuck/failed
```bash
railway logs backend
railway logs db
```

### Database not connecting
- Check `DATABASE_URL` is set
- Verify database service is running: `railway logs db`

### Frontend can't reach backend
- Update `VITE_API_URL` to actual backend domain
- Check CORS settings in backend

### Out of memory
- Railway starter plan: 512MB per service
- For more: upgrade plan in dashboard

## Cost

- **Starter**: $5/month (includes $5 free credit)
- Each service ~$2/month after credit expires
- Database: ~$7/month managed PostgreSQL

**First month**: Mostly free (with $5 credit)

## Next Steps After Deployment

1. ✅ Test user registration at https://your-frontend-domain
2. ✅ Test Stripe payment flow (test keys work)
3. ✅ Verify database backups configured
4. ✅ Setup monitoring/alerts
5. ✅ Configure custom domain (Settings → Domains)

## Custom Domain Setup

1. Go to service → Settings → Domains
2. Add your domain: `yourdomain.com`
3. Update DNS:
   - Get CNAME from Railway
   - Add CNAME record to your DNS provider
   - Wait 5-15 minutes for propagation

## Automatic Deployments

Railway auto-deploys on git push to main branch:

```bash
git add .
git commit -m "Production ready"
git push origin main
# Railway automatically detects push and redeploys!
```

## Need Help?

- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://railway.app/status

**You're ready to deploy! Go to https://railway.app/dashboard and click "New Project"**
