#!/bin/bash
# Quick deploy script for VPS (single-host production)
# Usage: ./deploy-vps.sh user@host.com /path/to/project

set -e

HOST=$1
PROJECT_PATH=${2:-/opt/saas_platform}

echo "🚀 Deploying to $HOST:$PROJECT_PATH"

# SSH and execute remote commands
ssh "$HOST" << EOF
  set -e
  
  echo "📦 Pulling latest code..."
  cd $PROJECT_PATH
  git pull origin main
  
  echo "🔐 Loading production environment..."
  if [ -f .env.production ]; then
    export \$(cat .env.production | xargs)
  fi
  
  echo "🐳 Pulling latest images..."
  docker compose -f docker-compose.production.yml pull
  
  echo "▶️  Starting services..."
  docker compose -f docker-compose.production.yml up -d
  
  echo "⏳ Waiting for services to be healthy..."
  sleep 10
  
  echo "✅ Checking service status..."
  docker compose -f docker-compose.production.yml ps
  
  echo "🔄 Checking logs..."
  docker compose -f docker-compose.production.yml logs backend --tail 20
  
  echo "✨ Deployment complete!"
EOF

echo "✅ Deployment finished!"
