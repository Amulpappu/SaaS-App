# Deployment Guide - SaaS Platform

Choose your deployment option based on your infrastructure needs:

---

## 1. **Local/Development** (Already Running ✓)

```bash
docker compose up -d --pull always
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 2. **Single Host Production** (Recommended for Small Teams)

Best for: MVP, small teams, budget-conscious deployments.

### Option A: Docker Compose on a VPS (DigitalOcean, Linode, AWS EC2)

#### Prerequisites
- VPS with Docker and Docker Compose installed
- Domain name (optional)
- SSH access to server

#### Setup Steps

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   docker --version
   ```

3. **Clone or upload your project**
   ```bash
   git clone https://github.com/your-org/saas_platform.git
   cd saas_platform
   ```

4. **Create `.env` file with production values**
   ```bash
   cat > .env << EOF
   SECRET_KEY=$(openssl rand -hex 32)
   POSTGRES_USER=saas_user
   POSTGRES_PASSWORD=$(openssl rand -hex 16)
   POSTGRES_DB=saas_db
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   FRONTEND_URL=https://yourdomain.com
   EOF
   ```

5. **Start the stack**
   ```bash
   docker compose up -d --pull always
   ```

6. **Verify services**
   ```bash
   docker compose ps
   docker compose logs -f backend
   ```

7. **Setup Nginx reverse proxy (optional but recommended)**
   ```bash
   # Install Nginx
   apt-get update && apt-get install -y nginx certbot python3-certbot-nginx

   # Create Nginx config
   cat > /etc/nginx/sites-available/saas << 'EOF'
   upstream backend {
       server localhost:8000;
   }

   upstream frontend {
       server localhost:80;
   }

   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Redirect to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       location /api/ {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           proxy_pass http://frontend;
           proxy_set_header Host $host;
       }
   }
   EOF

   # Enable site and get SSL
   ln -s /etc/nginx/sites-available/saas /etc/nginx/sites-enabled/
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   systemctl enable nginx && systemctl restart nginx
   ```

#### Maintenance
```bash
# View logs
docker compose logs -f backend

# Update (pull latest images and restart)
docker compose pull
docker compose up -d

# Backup database
docker compose exec db pg_dump -U saas_user saas_db > backup-$(date +%Y%m%d).sql

# Restore database
docker compose exec -T db psql -U saas_user saas_db < backup-20240101.sql
```

---

## 3. **Docker Swarm** (Multi-Node, Self-Hosted)

Best for: Team-driven deployments, high availability, self-hosted.

### Initialize Swarm
```bash
# On manager node
docker swarm init --advertise-addr YOUR_MANAGER_IP

# Add worker nodes (run output command on worker machines)
docker swarm join-token worker

# Verify cluster
docker node ls
```

### Deploy Stack
```bash
# Create docker-compose-swarm.yml (extends compose with swarm-specific features)
docker stack deploy -c docker-compose.yml saas_platform

# Check deployment
docker stack ps saas_platform
docker stack services saas_platform

# Scale service
docker service scale saas_platform_backend=3

# View logs
docker service logs saas_platform_backend
```

---

## 4. **Kubernetes** (Cloud-Native, Multi-Node)

Best for: Enterprise, multi-region, autoscaling needs.

### Prerequisites
- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- `kubectl` configured
- `helm` (optional but recommended)

### Deploy with Manifests

1. **Create namespace and secrets**
   ```bash
   kubectl create namespace saas
   kubectl create secret generic saas-secrets \
     --from-literal=SECRET_KEY=$(openssl rand -hex 32) \
     --from-literal=STRIPE_SECRET_KEY=sk_live_xxxxx \
     --from-literal=STRIPE_WEBHOOK_SECRET=whsec_xxxxx \
     -n saas
   ```

2. **Create ConfigMap for non-sensitive config**
   ```bash
   kubectl create configmap saas-config \
     --from-literal=FRONTEND_URL=https://yourdomain.com \
     --from-literal=DATABASE_URL=postgresql://saas_user:$(kubectl get secret saas-secrets -n saas -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)@saas-postgres:5432/saas_db \
     -n saas
   ```

3. **Deploy PostgreSQL StatefulSet**
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: postgres-pvc
     namespace: saas
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 10Gi
   ---
   apiVersion: apps/v1
   kind: StatefulSet
   metadata:
     name: postgres
     namespace: saas
   spec:
     serviceName: postgres
     replicas: 1
     selector:
       matchLabels:
         app: postgres
     template:
       metadata:
         labels:
           app: postgres
       spec:
         containers:
         - name: postgres
           image: postgres:15-alpine
           ports:
           - containerPort: 5432
           env:
           - name: POSTGRES_USER
             value: saas_user
           - name: POSTGRES_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: saas-secrets
                 key: POSTGRES_PASSWORD
           - name: POSTGRES_DB
             value: saas_db
           volumeMounts:
           - name: postgres-storage
             mountPath: /var/lib/postgresql/data
           livenessProbe:
             exec:
               command:
               - /bin/sh
               - -c
               - pg_isready -U saas_user
             initialDelaySeconds: 30
             periodSeconds: 10
         volumeClaimTemplates:
         - metadata:
             name: postgres-storage
           spec:
             accessModes: [ "ReadWriteOnce" ]
             resources:
               requests:
                 storage: 10Gi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: postgres
     namespace: saas
   spec:
     clusterIP: None
     selector:
       app: postgres
     ports:
     - port: 5432
       targetPort: 5432
   EOF
   ```

4. **Deploy Backend Deployment**
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: backend
     namespace: saas
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: backend
     strategy:
       type: RollingUpdate
       rollingUpdate:
         maxUnavailable: 1
         maxSurge: 1
     template:
       metadata:
         labels:
           app: backend
       spec:
         containers:
         - name: backend
           image: your-registry/saas_platform-backend:latest
           imagePullPolicy: Always
           ports:
           - containerPort: 8000
           env:
           - name: DATABASE_URL
             valueFrom:
               configMapKeyRef:
                 name: saas-config
                 key: DATABASE_URL
           - name: SECRET_KEY
             valueFrom:
               secretKeyRef:
                 name: saas-secrets
                 key: SECRET_KEY
           - name: STRIPE_SECRET_KEY
             valueFrom:
               secretKeyRef:
                 name: saas-secrets
                 key: STRIPE_SECRET_KEY
           livenessProbe:
             httpGet:
               path: /docs
               port: 8000
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /docs
               port: 8000
             initialDelaySeconds: 5
             periodSeconds: 5
           resources:
             requests:
               cpu: 100m
               memory: 256Mi
             limits:
               cpu: 500m
               memory: 512Mi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: backend
     namespace: saas
   spec:
     selector:
       app: backend
     ports:
     - port: 8000
       targetPort: 8000
     type: ClusterIP
   EOF
   ```

5. **Deploy Frontend Deployment**
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: frontend
     namespace: saas
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: frontend
     template:
       metadata:
         labels:
           app: frontend
       spec:
         containers:
         - name: frontend
           image: your-registry/saas_platform-frontend:latest
           imagePullPolicy: Always
           ports:
           - containerPort: 80
           livenessProbe:
             httpGet:
               path: /
               port: 80
             initialDelaySeconds: 10
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /
               port: 80
             initialDelaySeconds: 5
             periodSeconds: 5
           resources:
             requests:
               cpu: 50m
               memory: 128Mi
             limits:
               cpu: 200m
               memory: 256Mi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: frontend
     namespace: saas
   spec:
     selector:
       app: frontend
     ports:
     - port: 80
       targetPort: 80
     type: LoadBalancer
   EOF
   ```

6. **Verify deployment**
   ```bash
   kubectl get pods -n saas
   kubectl get svc -n saas
   kubectl logs -f deployment/backend -n saas
   ```

---

## 5. **Managed Cloud Platforms** (Easiest)

### Railway.app (Recommended for SaaS)
Already configured in your `railway.json`:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render.com
```bash
# Push to GitHub
git push origin main

# Connect repo in Render dashboard
# Set environment variables
# Deploy (automatic on git push)
```

### AWS Elastic Container Service (ECS)
```bash
# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag saas_platform-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/saas-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/saas-backend:latest

# Define task definition (JSON in AWS console)
# Create ECS service
# Load balancer routes traffic
```

### Google Cloud Run (Serverless)
```bash
# Enable API
gcloud run deploy saas-backend \
  --image gcr.io/your-project/saas-backend:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=your-db-url \
  --memory 512Mi \
  --cpu 1
```

---

## 6. **Production Checklist**

- [ ] Environment variables securely managed (.env not in git)
- [ ] Database backups automated (daily)
- [ ] HTTPS/SSL enabled (Let's Encrypt)
- [ ] Monitoring/alerting setup (Prometheus, DataDog, New Relic)
- [ ] Centralized logging (ELK stack, Splunk, Datadog)
- [ ] Resource limits defined (CPU, memory)
- [ ] Health checks passing
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Disaster recovery tested

---

## 7. **Troubleshooting**

### Services not starting
```bash
docker compose logs backend
docker compose logs db
```

### Database connection errors
```bash
# Verify network connectivity
docker network inspect saas_platform_saas-network
docker exec -it saas_backend nc -zv db 5432
```

### Port conflicts
```bash
# Find what's using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows
```

### Out of disk space
```bash
docker system df
docker system prune -a --volumes
```

---

## Next Steps

1. **Choose deployment option** based on your needs (single host, swarm, or k8s)
2. **Push images to registry** (Docker Hub, ECR, GCR)
3. **Setup CI/CD pipeline** (GitHub Actions, GitLab CI)
4. **Configure monitoring & alerts**
5. **Test failover scenarios**
6. **Document runbooks** for team

Sources:
- https://docs.docker.com/compose/how-tos/production/
- https://docs.docker.com/guides/swarm-deploy/
- https://docs.docker.com/guides/orchestration/
