#!/bin/bash
# Health check and monitoring script
# Can be run as cron job or manually

set -e

echo "🏥 SaaS Platform Health Check"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
  local service=$1
  local port=$2
  
  if docker compose ps | grep -q "$service.*Up"; then
    echo -e "${GREEN}✅${NC} $service is running"
    return 0
  else
    echo -e "${RED}❌${NC} $service is NOT running"
    return 1
  fi
}

check_port() {
  local service=$1
  local port=$2
  
  if nc -z localhost $port 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $service port $port is accessible"
    return 0
  else
    echo -e "${RED}❌${NC} $service port $port is NOT accessible"
    return 1
  fi
}

check_http() {
  local name=$1
  local url=$2
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "200" ] || [ "$status" = "301" ]; then
    echo -e "${GREEN}✅${NC} $name responded with HTTP $status"
    return 0
  else
    echo -e "${RED}❌${NC} $name returned HTTP $status"
    return 1
  fi
}

echo "📦 Service Status:"
check_service "db" "5432"
check_service "backend" "8000"
check_service "frontend" "80"
echo ""

echo "🌐 Port Accessibility:"
check_port "PostgreSQL" "5432"
check_port "Backend API" "8000"
check_port "Frontend" "80"
echo ""

echo "📡 HTTP Health Checks:"
check_http "Backend API" "http://localhost:8000/docs"
check_http "Frontend" "http://localhost"
echo ""

echo "💾 Database Check:"
if docker compose exec -T db psql -U saas_user saas_db -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Database connection successful"
else
  echo -e "${RED}❌${NC} Database connection FAILED"
fi
echo ""

echo "📊 System Resources:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -4
echo ""

echo "📋 Recent Logs:"
echo "--- Backend ---"
docker compose logs backend --tail 5 | tail -5
echo ""
echo "--- Database ---"
docker compose logs db --tail 3 | tail -3
echo ""

echo "✨ Health check complete!"
