# ✅ Railway Deployment Checklist

## Pre-Deployment (Do These Now)

### Generate Secrets
```bash
# Run these commands and save the output:
openssl rand -hex 32    # SECRET_KEY
openssl rand -hex 16    # POSTGRES_PASSWORD (optional - Railway sets this)
```

### Get Stripe Keys (If Using Stripe)
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Live Secret Key** (starts with `sk_live_`)
3. Copy **Live Webhook Secret** (starts with `whsec_`)
4. Save these values

### Verify Git is Ready
```bash
git status
# Everything committed? Should show: "nothing to commit, working tree clean"

git branch
# On main branch?
```

### Quick Local Test
```bash
docker compose up -d
# Wait 30 seconds
curl http://localhost:8000/docs
curl http://localhost/
# Both should respond ✓
docker compose down
```

---

## Railway Setup (Follow These Steps)

### Step 1: Create Account
- [ ] Go to https://railway.app
- [ ] Click "Sign up"
- [ ] Sign in with GitHub
- [ ] Authorize Railway

### Step 2: Create Project
- [ ] Go to https://railway.app/dashboard
- [ ] Click "+ New Project"
- [ ] Select "Deploy from GitHub"

### Step 3: Connect GitHub
- [ ] Click "Configure GitHub App"
- [ ] Select your GitHub account
- [ ] Choose "Only select repositories"
- [ ] Select "saas_platform"
- [ ] Click "Install"

### Step 4: Deploy Repository
- [ ] Back in Railway, click "Deploy from GitHub"
- [ ] Select "saas_platform"
- [ ] Select branch: "main"
- [ ] Click "Deploy"

### Step 5: Wait for Auto-Detection
- [ ] Railway reads railway.json
- [ ] Creates 3 services (db, backend, frontend)
- [ ] This takes ~2 minutes

### Step 6: Add Environment Variables
- [ ] Click "backend" service
- [ ] Go to "Variables" tab
- [ ] Add `SECRET_KEY` = <your generated secret>
- [ ] Add `STRIPE_SECRET_KEY` = `sk_live_xxxxx`
- [ ] Add `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
- [ ] Click "Save"

### Step 7: Wait for Deployment
- [ ] All 3 services should show "Running" ✓
- [ ] Watch logs for errors
- [ ] Wait ~10 minutes total

---

## Post-Deployment (Verify Everything)

### Check Service Status
- [ ] Go to project dashboard
- [ ] "db" service: ✓ Running (healthy)
- [ ] "backend" service: ✓ Running (healthy)
- [ ] "frontend" service: ✓ Running (healthy)

### Get Live URLs
- [ ] Click "frontend" → "Deployments"
- [ ] Copy frontend URL (save this!)
- [ ] Click "backend" → "Deployments"
- [ ] Copy backend URL (save this!)

### Test Backend API
```bash
# Replace URL with your actual backend URL
curl https://your-backend-url/docs
# Should return HTML (Swagger UI)
```
- [ ] API responds with 200 OK
- [ ] Swagger UI loads in browser

### Test Frontend
```bash
# Open in browser:
https://your-frontend-url
```
- [ ] React app loads
- [ ] No console errors
- [ ] Can see login/register page

### Test Database
- [ ] Check backend logs: `[✓] Database tables verified.`
- [ ] No database connection errors
- [ ] Tables created successfully

### Test User Registration
- [ ] Go to frontend URL
- [ ] Click "Register"
- [ ] Create test account (use fake email)
- [ ] Should confirm registration
- [ ] Try to login

---

## Stripe Integration (If Using)

### Add Live Keys to Railway
- [ ] Go to backend service → Variables
- [ ] Verify `STRIPE_SECRET_KEY` is set (sk_live_...)
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set (whsec_...)

### Test Stripe Integration
- [ ] Login to your app
- [ ] Go to billing/payments
- [ ] Try test payment with card: 4242 4242 4242 4242
- [ ] Should process successfully
- [ ] Check Stripe dashboard for transaction

---

## Monitoring Setup

### Enable Logs
- [ ] Dashboard → Service → "Logs" tab
- [ ] Logs should stream in real-time
- [ ] Check for any error messages

### Check Metrics
- [ ] Dashboard → Service → "Metrics" tab
- [ ] View CPU usage (should be low for fresh deployment)
- [ ] View memory usage (should be <200MB)

### Save Deployment URLs
- [ ] Backend: ________________________
- [ ] Frontend: ________________________
- [ ] Custom domain (later): ________________________

---

## Custom Domain Setup (Optional)

### Only Do This If You Have a Domain

- [ ] Click Settings in Railway project
- [ ] Click "+ Add Domain"
- [ ] Enter your domain: yourdomain.com
- [ ] Copy the CNAME record Railway provides
- [ ] Add CNAME to your DNS provider settings
- [ ] Wait 5-15 minutes for propagation
- [ ] Test with: https://yourdomain.com

---

## Troubleshooting Checklist

### If Deployment is Stuck
- [ ] Check backend logs for errors: `railway logs backend`
- [ ] Check database logs: `railway logs db`
- [ ] Verify all environment variables are set
- [ ] Try clicking "Redeploy" in dashboard

### If Backend Won't Connect to Database
- [ ] Check `DATABASE_URL` is set in backend variables
- [ ] Check database service is "Running"
- [ ] View db logs: `railway logs db`
- [ ] Verify `POSTGRES_PASSWORD` is set

### If Frontend Can't Reach Backend
- [ ] Check `VITE_API_URL` is set correctly
- [ ] Should be exactly: `https://your-backend-url`
- [ ] Check browser console for CORS errors
- [ ] Verify backend is actually running

### If Payment Flow Fails
- [ ] Verify Stripe keys are correct (sk_live_, not sk_test_)
- [ ] Check Stripe webhook is configured in dashboard
- [ ] View backend logs for errors
- [ ] Test with Stripe test card first

---

## Success Criteria

Everything is working when:

- [ ] All 3 services show "Running" in dashboard
- [ ] Backend API responds to requests
- [ ] Frontend app loads and displays correctly
- [ ] Can register new user
- [ ] Database stores data (check in logs)
- [ ] Logs show no errors
- [ ] API health check returns 200

---

## After Going Live

### Week 1
- [ ] Test all features
- [ ] Monitor logs daily
- [ ] Check for errors

### Week 2
- [ ] Setup custom domain (if you have one)
- [ ] Enable monitoring alerts
- [ ] Test backup procedure

### Week 3
- [ ] Review performance metrics
- [ ] Optimize if needed
- [ ] Plan scaling strategy

---

## Important Links

| Task | Link |
|------|------|
| Railway Dashboard | https://railway.app/dashboard |
| Stripe Dashboard | https://dashboard.stripe.com |
| Railway Docs | https://docs.railway.app |
| Railway Discord | https://discord.gg/railway |
| Project Status | https://railway.app/status |

---

## Quick Commands (If Using Railway CLI)

```bash
# Login to Railway
railway login

# View project status
railway status

# View logs (follow)
railway logs -f

# View specific service logs
railway logs backend
railway logs db
railway logs frontend

# Redeploy
railway deploy

# View environment variables
railway env
```

---

## Emergency Procedures

### If Everything Breaks
1. Go to dashboard → project settings
2. Click "Redeploy" button
3. Watch logs for what's happening
4. Check environment variables are all set

### If You Need to Rollback
1. Go to Service → "Deployments" tab
2. Click on previous deployment
3. Click "Rollback"
4. Railway redeploys previous working version

### If Database Is Corrupted
1. Go to "db" service → "Data" tab
2. Select recent backup
3. Click "Restore"
4. Wait for restore to complete
5. Redeploy backend to reconnect

---

## Final Notes

✅ Your `railway.json` is perfectly configured
✅ All environment variables auto-set except Stripe keys
✅ Zero manual infrastructure setup needed
✅ Auto-scales as you grow
✅ Built-in monitoring and backups
✅ One-click deployments on git push

**You're ready! Start with Step 1 above.**
