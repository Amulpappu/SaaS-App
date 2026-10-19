# 🚀 Quick Start - Choose Your Deployment Path

## Option 1: Railway.app (Easiest - Recommended) ⭐

```bash
npm install -g @railway/cli
railway login
railway up
```

✅ Auto-deploys on git push | ✅ Managed DB | ✅ $5+/month

---

## Option 2: Render.com (Very Easy)

1. Push to GitHub: `git push origin main`
2. Go to: https://dashboard.render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repo
5. Set environment variables (Stripe keys, secrets)
6. Deploy

✅ Auto-deploys | ✅ Managed DB | ✅ $21+/month

---

## Option 3: Self-Hosted VPS ($5-10/month)

```bash
# 1. Get a VPS (DigitalOcean, Linode, Vultr, AWS EC2)
# 2. SSH into server
ssh root@your-ip

# 3. Install Docker
curl -fsSL https://get.docker.com | sh

# 4. Clone project
git clone your-repo
cd your-repo

# 5. Setup environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 6. Start
docker compose -f docker-compose.production.yml up -d

# 7. Verify
docker compose ps
```

✅ Full control | ✅ Cheapest | ❌ Need to manage

---

## Environment Variables Needed

Create `.env.production` with:

```env
SECRET_KEY=<openssl rand -hex 32>
POSTGRES_PASSWORD=<openssl rand -hex 16>
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
FRONTEND_URL=https://yourdomain.com
```

---

## After Deployment

```bash
# Test API
curl https://yourdomain.com/api/health

# View logs
docker compose logs -f backend

# Monitor
./scripts/health-check.sh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Services not starting | `docker compose logs` to see error |
| Database won't connect | `docker compose exec backend nc -zv db 5432` |
| Port already in use | `docker compose down` first |
| Out of disk | `docker system prune -a` |
| Need backup | `docker compose exec db pg_dump -U saas_user saas_db > backup.sql` |

---

## Support Docs

- **Full guide**: `DEPLOYMENT_GUIDE.md`
- **Platform-specific**: `PLATFORM_DEPLOYMENT.md`
- **Pre-flight checks**: `DEPLOYMENT_CHECKLIST.md`
- **Monitoring**: `scripts/health-check.sh`
- **Backups**: `scripts/backup-db.sh`

---

**Recommendation**: Start with Railway.app for fastest time-to-live. Migrate to VPS later if needed.
