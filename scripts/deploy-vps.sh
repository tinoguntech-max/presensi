#!/bin/bash
# Jalankan di VPS setelah git pull
# Usage: bash scripts/deploy-vps.sh

set -e

APP_DIR="/var/www/presensi"
REPO="https://github.com/USERNAME/REPO_NAME.git"  # ganti ini

echo "=== Pull latest code ==="
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR
  git pull origin main
else
  git clone $REPO $APP_DIR
  cd $APP_DIR
fi

echo "=== Install backend dependencies ==="
cd $APP_DIR/backend
npm install --production

echo "=== Build frontend ==="
cd $APP_DIR/frontend
npm install
npm run build

echo "=== Restart backend ==="
pm2 restart presensi-backend 2>/dev/null || \
  pm2 start $APP_DIR/backend/src/server.js --name presensi-backend
pm2 save

echo "=== Reload Nginx ==="
nginx -t && systemctl reload nginx

echo "=== Deploy selesai! ==="
pm2 status
