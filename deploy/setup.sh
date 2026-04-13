#!/bin/bash

###############################################################################
# ImAInd Restaurant Experience - VPS Setup Script
# 
# Usage: bash deploy/setup.sh
# 
# This script automates the deployment of ImAInd Experience to a VPS.
# It reads credentials from /var/www/brain/.env (shared with BRAiN project)
# and configures the app with PM2, Nginx, and SSL.
#
# Prerequisites:
# - Node.js 22+ installed
# - pnpm installed
# - MySQL accessible at localhost
# - Nginx installed
# - PM2 installed globally
# - Certbot installed (for SSL)
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BRAIN_ENV_FILE="/var/www/brain/.env"
APP_DIR="/var/www/experience"
UPLOADS_DIR="/var/www/experience/uploads"
APP_NAME="imaind-experience"
APP_PORT="3004"
DOMAIN="${DOMAIN:-experience.imaind.tech}"

echo -e "${YELLOW}=== ImAInd Experience VPS Setup ===${NC}"

# Step 1: Verify prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not installed${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}ERROR: pnpm not installed${NC}"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}ERROR: PM2 not installed globally. Run: npm install -g pm2${NC}"
    exit 1
fi

if [ ! -f "$BRAIN_ENV_FILE" ]; then
    echo -e "${RED}ERROR: $BRAIN_ENV_FILE not found${NC}"
    echo -e "${RED}Make sure BRAiN project is deployed at /var/www/brain${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Step 2: Create app directory and clone repo
echo -e "\n${YELLOW}Step 2: Setting up application directory...${NC}"

if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    echo -e "${GREEN}✓ Created $APP_DIR${NC}"
fi

# Step 3: Extract credentials from BRAiN .env
echo -e "\n${YELLOW}Step 3: Loading shared credentials from BRAiN...${NC}"

source "$BRAIN_ENV_FILE"

# Verify critical variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not found in $BRAIN_ENV_FILE${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}ERROR: JWT_SECRET not found in $BRAIN_ENV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Loaded credentials from BRAiN${NC}"

# Step 4: Create .env file for Experience app
echo -e "\n${YELLOW}Step 4: Creating .env file...${NC}"

cat > "$APP_DIR/.env" << EOF
# Database (shared with BRAiN)
DATABASE_URL=$DATABASE_URL

# JWT Authentication
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$JWT_SECRET

# App Configuration
NODE_ENV=production
APP_ID=organic-order
PORT=$APP_PORT

# Gemini LLM (required - get from Google AI Studio)
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# File Storage
UPLOADS_DIR=$UPLOADS_DIR
UPLOADS_URL_PREFIX=https://$DOMAIN/uploads

# Optional: Stripe (if needed)
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-}

# Optional: WhatsApp Webhook (for lead notifications)
WHATSAPP_WEBHOOK_URL=${WHATSAPP_WEBHOOK_URL:-}
EOF

echo -e "${GREEN}✓ Created .env file${NC}"
echo -e "${YELLOW}⚠ IMPORTANT: Edit $APP_DIR/.env and add GEMINI_API_KEY${NC}"

# Step 5: Install dependencies
echo -e "\n${YELLOW}Step 5: Installing dependencies...${NC}"

cd "$APP_DIR"
pnpm install --frozen-lockfile

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 6: Build application
echo -e "\n${YELLOW}Step 6: Building application...${NC}"

pnpm build

echo -e "${GREEN}✓ Build completed${NC}"

# Step 7: Create uploads directory
echo -e "\n${YELLOW}Step 7: Setting up file storage...${NC}"

mkdir -p "$UPLOADS_DIR"
chmod 755 "$UPLOADS_DIR"

echo -e "${GREEN}✓ Uploads directory ready at $UPLOADS_DIR${NC}"

# Step 8: Configure PM2
echo -e "\n${YELLOW}Step 8: Configuring PM2...${NC}"

pm2 delete "$APP_NAME" 2>/dev/null || true

pm2 start "pnpm start" \
    --name "$APP_NAME" \
    --env production \
    --log "$APP_DIR/logs/pm2.log" \
    --error "$APP_DIR/logs/pm2-error.log" \
    --cwd "$APP_DIR"

pm2 save
pm2 startup

echo -e "${GREEN}✓ PM2 configured${NC}"

# Step 9: Configure Nginx
echo -e "\n${YELLOW}Step 9: Configuring Nginx...${NC}"

cat > "/etc/nginx/sites-available/$APP_NAME" << EOF
upstream experience_backend {
    server 127.0.0.1:$APP_PORT;
}

server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL certificates (configure with certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Client max upload size
    client_max_body_size 50M;
    
    # Proxy to backend
    location / {
        proxy_pass http://experience_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Serve uploaded files
    location /uploads {
        alias $UPLOADS_DIR;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/$APP_NAME" 2>/dev/null || true

# Test Nginx config
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
else
    echo -e "${RED}ERROR: Nginx configuration test failed${NC}"
    exit 1
fi

# Step 10: Setup SSL with Certbot
echo -e "\n${YELLOW}Step 10: Setting up SSL certificate...${NC}"

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${YELLOW}Running certbot to obtain SSL certificate...${NC}"
    certbot certonly --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@imaind.tech
    echo -e "${GREEN}✓ SSL certificate obtained${NC}"
else
    echo -e "${GREEN}✓ SSL certificate already exists${NC}"
fi

# Step 11: Setup log rotation
echo -e "\n${YELLOW}Step 11: Setting up log rotation...${NC}"

cat > "/etc/logrotate.d/$APP_NAME" << EOF
$APP_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload $APP_NAME > /dev/null 2>&1 || true
    endscript
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"

# Step 12: Verify deployment
echo -e "\n${YELLOW}Step 12: Verifying deployment...${NC}"

sleep 2

if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$APP_PORT/api/auth/me" | grep -q "401\|200"; then
    echo -e "${GREEN}✓ Application is running${NC}"
else
    echo -e "${RED}WARNING: Could not verify application is running${NC}"
    echo -e "${YELLOW}Check logs: pm2 logs $APP_NAME${NC}"
fi

# Final summary
echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Edit $APP_DIR/.env and add GEMINI_API_KEY"
echo "2. Verify SSL certificate: certbot renew --dry-run"
echo "3. Check app status: pm2 status"
echo "4. View logs: pm2 logs $APP_NAME"
echo "5. Access app: https://$DOMAIN"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  pm2 restart $APP_NAME      - Restart app"
echo "  pm2 logs $APP_NAME         - View logs"
echo "  pm2 monit                  - Monitor processes"
echo "  systemctl status nginx     - Check Nginx"
echo ""
echo -e "${GREEN}Happy deploying!${NC}"
