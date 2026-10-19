# 🎯 RAILWAY DEPLOYMENT - START HERE

## ⚡ 20-Minute Deploy Plan

Your app is ready. Here's exactly what to do:

---

## STEP 1: Generate Secrets (2 minutes)

Open your terminal and run these commands:

```bash
# Generate SECRET_KEY
openssl rand -hex 32
# Copy the entire output, save it
```

```bash
# Generate POSTGRES_PASSWORD (optional - Railway sets this)
openssl rand -hex 16
# Copy if you want, or Railway will auto-generate
```

**Save these values** - you'll need them in Step 5.

---

## STEP 2: Get Stripe Keys (If Using Stripe)

1. Go to: https://dashboard.stripe.com/apikeys
2. Under **Live Keys**, copy:
   - Secret Key (starts with `sk_live_`)
   - Webhook Secret (starts with `whsec_`)
3. **Save these values** - you'll need them in Step 5

---

## STEP 3: Commit and Push to GitHub (2 minutes)

```bash
cd /path/to/saas_platform
git status
# Should show: "nothing to commit, working tree clean"

git push origin main
# Push to GitHub (if not already pushed)
```

---

## STEP 4: Sign Up to Railway (2 minutes)

1. Go to: **https://railway.app**
2. Click **"Sign up"** (top right)
3. Click **"Sign in with GitHub"**
4. Authorize Railway to access your GitHub account

---

## STEP 5: Create Railway Project (3 minutes)

1. Go to: **https://railway.app/dashboard**
2. Click **"+ New Project"** button
3. Select **"Deploy from GitHub"**
4. Click **"Configure GitHub App"**
   - Select your GitHub account
   - Choose **"Only select repositories"**
   - Search for **"saas_platform"**
   - Click **"Install"**

---

## STEP 6: Deploy Your Repository (2 minutes)

1. Back in Railway dashboard, click **"Deploy from GitHub"**
2. Select **"saas_platform"** from the list
3. Select branch: **"main"**
4. Click **"Deploy"**

**Wait here while Railway reads railway.json and creates services...**

This takes ~2-3 minutes. Watch the status on your screen.

---

## STEP 7: Add Environment Variables (3 minutes)

Once all 3 services appear (db, backend, frontend):

1. Click on **"backend"** service
2. Go to **"Variables"** tab
3. Add these environment variables:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Paste the value from Step 1 |
| `STRIPE_SECRET_KEY` | Paste from Step 2 (optional) |
| `STRIPE_WEBHOOK_SECRET` | Paste from Step 2 (optional) |

4. Click **"Save"**

**Railway will automatically redeploy with the new variables!**

---

## STEP 8: Wait for Deployment (5 minutes)

All 3 services should now show **"Running"** with a green checkmark:

- ✅ **db** (PostgreSQL)
- ✅ **backend** (FastAPI)
- ✅ **frontend** (React)

Watch the logs if you want to see what's happening. If any service shows red, click it and check the logs.

---

## STEP 9: Get Your Live URLs (1 minute)

1. Click **"frontend"** service
2. Go to **"Deployments"** tab
3. Copy the URL (looks like: `https://saas-frontend-prod-xxxxx.up.railway.app`)
4. **Save this - it's your live frontend!**

Do the same for **"backend"** service to get backend URL.

---

## STEP 10: Test Your Deployment (2 minutes)

### Test Backend API

```bash
# Replace with your actual backend URL
curl https://your-backend-url/docs
```

Should show HTML (Swagger UI) - not an error.

### Test Frontend

Open in browser:
```
https://your-frontend-url
```

Should show your React app with login/register page.

---

## STEP 11: Test User Registration (1 minute)

1. Open your frontend URL in browser
2. Click **"Register"**
3. Create a test account
4. Should complete successfully
5. Try to **"Login"** with your credentials

If this works, **you're deployed!** 🎉

---

## That's It!

You're now live on Railway!

Your app is:
- ✅ Running on production servers
- ✅ Using managed PostgreSQL database
- ✅ Protected with HTTPS/SSL (automatic)
- ✅ Auto-scaling with traffic
- ✅ Ready for real users

---

## What Happens Next Time You Update

Just do:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway **automatically**:
1. Detects the push
2. Rebuilds Docker images
3. Deploys new version
4. Zero downtime

---

## Helpful Links

- **Your Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## If Something Goes Wrong

1. **Services stuck?**
   - Click service → "Logs" tab
   - Look for error messages
   - Usually an environment variable is missing

2. **Can't reach frontend?**
   - Check service status shows "Running"
   - Refresh browser page
   - Clear browser cache

3. **Backend connection failed?**
   - Check logs: `railway logs backend`
   - Verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are not empty

4. **Still stuck?**
   - Read RAILWAY_SETUP.md (more detailed)
   - Check RAILWAY_CHECKLIST.md (troubleshooting section)

---

## For More Details

- **Full setup guide**: RAILWAY_SETUP.md
- **Step-by-step checklist**: RAILWAY_CHECKLIST.md
- **Visual guide**: RAILWAY_VISUAL.txt

---

## You're Ready!

Your app is containerized, tested, and configured for Railway.

**Next: Open https://railway.app/dashboard and start Step 5 above.**

Good luck! 🚀
