#!/bin/bash
# Setup VPS Ubuntu 24 untuk Face Attendance SMKN 1 Kras
# Jalankan sebagai root: bash setup-vps.sh

set -e

echo "=== Update sistem ==="
apt update && apt upgrade -y

echo "=== Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== Install PM2 ==="
npm install -g pm2

echo "=== Install Nginx ==="
apt install -y nginx

echo "=== Install Certbot (SSL) ==="
apt install -y certbot python3-certbot-nginx

echo "=== Install Git ==="
apt install -y git

echo "=== Buat folder aplikasi ==="
mkdir -p /var/www/presensi

echo "=== Setup firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== Selesai! Node: $(node -v), NPM: $(npm -v) ==="
