#!/bin/bash
# Deploy aplikasi ke VPS
# Jalankan dari folder root project di komputer lokal:
# bash scripts/deploy.sh

VPS_IP="139.59.115.240"
VPS_USER="root"
APP_DIR="/var/www/presensi"

echo "=== Export database ==="
C:/xampp/mysql/bin/mysqldump.exe -u root --databases cbt_smk \
  --no-tablespaces --skip-lock-tables \
  > scripts/cbt_smk_export.sql
echo "Database exported."

echo "=== Build frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Upload ke VPS ==="
# Upload backend
scp -r backend/src backend/package.json backend/package-lock.json \
  $VPS_USER@$VPS_IP:$APP_DIR/backend/

# Upload frontend build
scp -r frontend/dist $VPS_USER@$VPS_IP:$APP_DIR/frontend/

# Upload database
scp scripts/cbt_smk_export.sql $VPS_USER@$VPS_IP:/tmp/

echo "=== Setup di VPS ==="
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
  cd /var/www/presensi/backend
  npm install --production

  # Import database
  mysql -u root < /tmp/cbt_smk_export.sql
  echo "Database imported."

  # Restart aplikasi
  pm2 restart presensi-backend 2>/dev/null || pm2 start src/server.js \
    --name presensi-backend \
    --interpreter node \
    -- --env production
  pm2 save
ENDSSH

echo "=== Deploy selesai! ==="
