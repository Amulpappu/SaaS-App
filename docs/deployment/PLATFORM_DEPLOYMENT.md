# Platform-Specific Deployment Instructions

## 1. Railway.app (Recommended - Easiest)

### Already configured in `railway.json`

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Start local preview
railway run docker compose up

# Deploy to production
railway up
```

Services auto-configured:
- PostgreSQL 15 managed database
- Backend auto-scaled
- Frontend auto-deployed
- SSL/HTTPS automatic
- Environment variables auto-injected

**Cost**: ~$5/month starter plan

---

## 2. Render.com

### Setup Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Render Dashboard**
   - Go to dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect GitHub account
   - Select repository

3. **Configure Backend Service**
   - **Name**: saas-backend
   - **Environment**: Docker
   - **Region**: Choose closest
   - **Build Command**: (leave default)
   - **Start Command**: (leave default)
   - **Plan**: Starter ($7/month)
   - **Environment Variables**:
     ```
     DATABASE_URL=postgresql://...
     SECRET_KEY=...
     STRIPE_SECRET_KEY=...
     ```

4. **Configure Frontend Service**
   - **Name**: saas-frontend
   - **Environment**: Docker
   - **Dockerfile Path**: frontend/Dockerfile
   - **Region**: Same as backend
   - **Plan**: Starter ($7/month)

5. **Add PostgreSQL Database**
   - "New +" → "PostgreSQL"
   - **Name**: saas-db
   - **Plan**: Starter ($7/month)
   - Copy connection string to backend env vars

6. **Auto-deploy on Git Push**
   - Enabled by default
   - Updates automatically when you push to main

**Cost**: ~$21/month (3 services × $7)

---

## 3. DigitalOcean App Platform

### Setup Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect DigitalOcean**
   - Go to console.digitalocean.com
   - Click "Apps" → "Create App"
   - Connect GitHub
   - Select repo and branch

3. **Auto-detect Services**
   - DigitalOcean detects Dockerfile for backend/frontend
   - Creates services automatically

4. **Configure Environment**
   - Add environment variables for each service
   - Link PostgreSQL database

5. **Deploy**
   - Click "Deploy"
   - ~3 minutes to production

**Cost**: $12/month (1 app + database)

---

## 4. AWS Elastic Container Service (ECS)

### One-time Setup

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name saas-backend --region us-east-1
aws ecr create-repository --repository-name saas-frontend --region us-east-1

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 3. Push images
docker build -t saas-backend:latest backend/
docker tag saas-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/saas-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/saas-backend:latest

# Same for frontend

# 4. Create RDS PostgreSQL database (AWS Console or CLI)
aws rds create-db-instance \
  --db-instance-identifier saas-db \
  --engine postgres \
  --db-instance-class db.t3.micro \
  --allocated-storage 20 \
  --master-username saas_user \
  --master-user-password YOUR_SECURE_PASSWORD

# 5. Create ECS Cluster
aws ecs create-cluster --cluster-name saas-cluster

# 6. Register Task Definition (JSON in console or create task-definition.json)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 7. Create Services
aws ecs create-service \
  --cluster saas-cluster \
  --service-name backend \
  --task-definition backend:1 \
  --desired-count 2
```

**Cost**: $10-50/month (varies by compute)

---

## 5. Google Cloud Run (Serverless)

### Fastest Option for Small Apps

```bash
# 1. Setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Build and push images
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/saas-backend backend/
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/saas-frontend frontend/

# 3. Deploy Backend
gcloud run deploy saas-backend \
  --image gcr.io/YOUR_PROJECT_ID/saas-backend:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=your-cloud-sql-url \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600

# 4. Deploy Frontend
gcloud run deploy saas-frontend \
  --image gcr.io/YOUR_PROJECT_ID/saas-frontend:latest \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --allow-unauthenticated

# 5. Setup Cloud SQL for PostgreSQL
gcloud sql instances create saas-db \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1
```

**Cost**: $0-5/month (pay-per-use)

---

## 6. Heroku (Deprecated but still works)

Heroku is sunsetting free tier, but still supports Postgres + Docker:

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create saas-app

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs -t
```

**Cost**: $7-50/month

---

## 7. Azure Container Instances

```bash
# 1. Create resource group
az group create --name saas --location eastus

# 2. Push images to ACR
az acr build --registry saasregistry --image saas-backend:latest backend/
az acr build --registry saasregistry --image saas-frontend:latest frontend/

# 3. Deploy containers
az container create \
  --resource-group saas \
  --name saas-app \
  --image saasregistry.azurecr.io/saas-frontend:latest \
  --ports 80 443 \
  --dns-name-label saas-app

# 4. Create Database
az postgres server create \
  --resource-group saas \
  --name saas-db \
  --admin-user saas_admin \
  --admin-password YOUR_PASSWORD \
  --sku-name B_Gen5_1
```

**Cost**: $20-50/month

---

## Comparison Table

| Platform | Cost | Ease | Scalability | Best For |
|----------|------|------|-------------|----------|
| Railway.app | $5+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Startups, Solo devs |
| Render | $21+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Small teams |
| DigitalOcean | $12+ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Medium apps |
| VPS + Docker | $5+ | ⭐⭐⭐ | ⭐⭐ | Cost-conscious |
| AWS ECS | $10+ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |
| Google Cloud Run | $0+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | API-first apps |
| Kubernetes | $50+ | ⭐ | ⭐⭐⭐⭐⭐ | Multi-region, complex |

---

## Recommended Path

**Start**: Railway.app or Render
**Scale**: DigitalOcean or AWS
**Enterprise**: Kubernetes (EKS, GKE, AKS)

---

## Post-Deployment

After deploying to any platform:

1. **Test endpoints**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Monitor logs**
   - Each platform has native log viewer
   - Setup alerts for errors

3. **Enable backups**
   - Most platforms auto-backup databases
   - Test restore procedure

4. **Setup CI/CD**
   - Connect GitHub Actions
   - Auto-deploy on git push

5. **Configure domain**
   - Point DNS to platform
   - Setup SSL (auto for most)

Sources:
- https://railway.app/docs
- https://render.com/docs
- https://docs.aws.amazon.com/ecs/
- https://cloud.google.com/run/docs
