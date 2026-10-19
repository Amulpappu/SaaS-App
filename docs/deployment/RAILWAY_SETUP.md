# 🚀 Railway Deployment - Complete Setup Guide

Your project is **perfectly configured for Railway** with `railway.json`!

---

## Step 1: Create Railway Account (2 minutes)

1. Go to: **https://railway.app**
2. Click **"Sign up"** (top right)
3. **Sign in with GitHub** (recommended)
4. Authorize Railway to access your GitHub

---

## Step 2: Create New Project (1 minute)

1. Go to: **https://railway.app/dashboard**
2. Click **"+ New Project"** button
3. Select **"Deploy from GitHub"**

---

## Step 3: Connect GitHub (1 minute)

1. Click **"Configure GitHub App"**
2. Select your GitHub account
3. Choose **"Only select repositories"**
4. Search for and select: **saas_platform**
5. Click **"Install"**

---

## Step 4: Select Repository (1 minute)

1. Back in Railway, click **"Deploy from GitHub"**
2. Select **saas_platform** from the list
3. Select branch: **main** (or your main branch)
4. Click **"Deploy"**

---

## Step 5: Railway Auto-Detects Configuration (Automatic)

Railway reads your `railway.json` and automatically creates:

✅ **PostgreSQL Database** (managed)
✅ **Backend Service** (from `backend/Dockerfile`)
✅ **Frontend Service** (from `frontend/Dockerfile`)

All services are automatically connected with the correct environment variables!

---

## Step 6: Add Required Environment Variables (3 minutes)

Railway auto-fills most variables from `railway.json`. You need to add:

### Generate Secrets (Run in Terminal)

```bash
openssl rand -hex 32    # Copy the output → SECRET_KEY
openssl rand -hex 16    # Copy the output → POSTGRES_PASSWORD
```

### Add to Railway (Backend Service)

1. Go to **Railway Dashboard**
2. Click on **"backend"** service
3. Go to **"Variables"** tab
4. Add these variables:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | `<paste from openssl output>` |
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` |

**Note**: Get Stripe keys from: https://dashboard.stripe.com/apikeys

### Database Variables (Already Set)

```
DATABASE_URL → Automatically configured by railway.json ✓
POSTGRES_PASSWORD → Automatically set ✓
POSTGRES_DB → saas_db ✓
POSTGRES_USER → postgres ✓
```

### Frontend Variables (Already Set)

```
VITE_API_URL → Automatically points to backend ✓
```

---

## Step 7: Deploy (Automatic)

The moment you add the variables, Railway automatically:

1. Builds Docker images
2. Creates PostgreSQL database
3. Starts backend service
4. Starts frontend service
5. Connects all services

**Watch the deployment progress in real-time!**

---

## Step 8: Monitor Deployment (5-10 minutes)

### View Deployment Status

1. Go to your **Railway Project Dashboard**
2. You'll see three services:
   - `db` (PostgreSQL)
   - `backend` (API)
   - `frontend` (React app)

3. Watch status change from "Building" → "Deploying" → "Running" ✓

### View Logs

```bash
# In terminal, if Railway CLI is installed:
railway logs db
railway logs backend
railway logs frontend

# Or click on service in dashboard → "Logs" tab
```

---

## Step 9: Get Your Live URLs (5 minutes)

Once all services show "Running":

1. Click **"frontend"** service
2. Click **"Deployments"** tab
3. Copy the URL: `https://saas-frontend-prod-xxxxx.up.railway.app`

4. Click **"backend"** service
5. Copy the URL: `https://saas-backend-prod-xxxxx.up.railway.app`

**These are your live URLs!**

---

## Step 10: Test Your Deployment (5 minutes)

### Test Backend API

```bash
curl https://saas-backend-prod-xxxxx.up.railway.app/docs
```

Should return Swagger UI (API documentation)

### Test Frontend

Open in browser:
```
https://saas-frontend-prod-xxxxx.up.railway.app
```

Should show your React SaaS app

### Test Database Connection

Backend should automatically connect to PostgreSQL. Check logs:

```
[✓] Database tables verified.
[✓] Starting up SaaS Platform API...
```

---

## Step 11: Test User Registration (5 minutes)

1. Open your frontend URL
2. Click **"Register"**
3. Create test account
4. Should receive confirmation
5. Login with credentials

---

## Step 12: Add Stripe Keys (If Using Stripe)

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy your **live Secret Key** (starts with `sk_live_`)
3. Copy your **live Webhook Secret** (starts with `whsec_`)
4. Add to Railway backend variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
5. Railway auto-redeploys with new env vars

---

## Step 13: Setup Custom Domain (Optional)

1. In Railway project → **Settings**
2. Click **"+ Add Domain"**
3. Enter your domain: `yourdomain.com`
4. Railway provides CNAME record
5. Add to your DNS provider
6. Wait 5-15 minutes for propagation
7. Access via: `https://yourdomain.com`

---

## Step 14: Setup Auto-Deployments (Automatic)

Railway is **already configured for auto-deploy**:

```bash
# Just push to git
git add .
git commit -m "Your changes"
git push origin main

# Railway automatically:
# 1. Detects new push
# 2. Builds new images
# 3. Deploys new version
# Takes ~5-10 minutes
```

---

## What Railway Provides (Automatic)

✅ **Managed PostgreSQL Database**
- Automatic backups
- Daily snapshots
- Point-in-time recovery
- High availability

✅ **Automatic SSL/HTTPS**
- Free certificates
- Auto-renewal
- All traffic encrypted

✅ **Built-in Monitoring**
- View logs in dashboard
- CPU/Memory metrics
- Deployment history
- Error alerts

✅ **Auto-Scaling**
- Services scale horizontally
- Handle traffic spikes
- Pay only for usage

✅ **Environment Management**
- Variables stored securely
- No secrets in git
- Auto-injected into services

---

## Monitoring Your App

### View Logs

1. Dashboard → Service → **"Logs"** tab
2. Real-time streaming logs
3. Searchable history

### View Metrics

1. Dashboard → Service → **"Metrics"** tab
2. CPU usage
3. Memory usage
4. Request count
5. Error rates

### View Deployments

1. Dashboard → Service → **"Deployments"** tab
2. All deployment history
3. Rollback to previous version if needed

---

## Database Management

### Backup Database

1. Dashboard → **"db"** service → **"Data"** tab
2. View all backups
3. Download backup file if needed

### Connect to Database

If you need direct access (rarely needed):

1. Get connection string from `db` service → **"Variables"**
2. Use with PostgreSQL client: `psql <connection-string>`

---

## Troubleshooting

### Services stuck "Building"

Check logs:
```bash
railway logs backend
# Look for error messages
```

### Database won't connect

1. Check `DATABASE_URL` variable is set
2. View logs: `railway logs db`
3. Verify `POSTGRES_PASSWORD` matches in env vars

### Frontend can't reach backend

1. Check `VITE_API_URL` variable
2. Should match backend's public domain
3. Check browser console for CORS errors

### Out of memory

Railway shows memory usage in dashboard:
- Increase plan tier if needed
- Or optimize app code

### Deployment keeps failing

1. Check build logs for errors
2. Verify Dockerfiles work locally: `docker build backend/`
3. Check all required env vars are set

---

## Costs (Transparent Pricing)

Railway uses a simple consumption model:

| Resource | Cost |
|----------|------|
| Backend service | ~$2-5/month |
| Frontend service | ~$1-3/month |
| PostgreSQL database | ~$10-20/month |
| **Total** | **~$13-28/month** |

Free credits: $5/month new customer credit

**First month is essentially free!**

---

## Environment Variables Reference

### Automatically Set by Railway

```
DATABASE_URL = postgresql://postgres:password@host:5432/saas_db
VITE_API_URL = https://backend-domain
FRONTEND_URL = https://frontend-domain
RAILWAY_PUBLIC_DOMAIN = your-service-domain
RAILWAY_INTERNAL_HOST = internal-db-host
```

### You Must Set

```
SECRET_KEY = <generated with openssl>
STRIPE_SECRET_KEY = sk_live_xxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxx
```

---

## Next Steps After Going Live

1. **Test everything**
   - User registration
   - Payment flow
   - Database queries

2. **Setup monitoring**
   - Enable error alerts
   - Monitor performance
   - Check logs daily

3. **Configure backups**
   - Railway auto-backups database
   - Test restore procedure

4. **Setup custom domain**
   - Point DNS to Railway
   - Get SSL certificate (auto)
   - Test with custom domain

5. **Enable auto-deployments**
   - Just push to git!
   - Railway handles rest

---

## Quick Reference

| Task | How |
|------|-----|
| View logs | Dashboard → Service → Logs |
| Add env vars | Dashboard → Service → Variables |
| Custom domain | Settings → Add Domain |
| Scale up | Dashboard → Plan selector |
| Rollback | Deployments → select previous |
| Download backup | db service → Data tab |
| Stop service | Pause button in dashboard |
| Delete project | Settings → Danger zone |

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Status**: https://railway.app/status
- **Email**: support@railway.app

---

## Summary

Your app deployment on Railway:

1. ✅ Already configured with `railway.json`
2. ✅ Auto-creates all services
3. ✅ Auto-sets most environment variables
4. ✅ Just add Stripe keys
5. ✅ Click deploy
6. ✅ Live in 10 minutes!

**You're ready! Go to https://railway.app/dashboard now!**
