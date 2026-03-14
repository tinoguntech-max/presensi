# Face Attendance App

Aplikasi absensi scan wajah dengan tampilan modern, elegan, responsif, dan soft ceria.

## Stack
- Frontend: React + Vite + Tailwind + Framer Motion + face-api.js
- Backend: Node.js + Express
- Database: MySQL

## Fitur
- Registrasi wajah karyawan
- Scan wajah untuk check-in dan check-out
- Dashboard statistik
- Riwayat absensi 100 data terbaru
- UI glassmorphism dengan gradient lembut

## Struktur
- `frontend/` → React app
- `backend/` → API Express + MySQL
- `database.sql` → schema database

## Cara Menjalankan

### 1) Import database
```bash
mysql -u root -p < database.sql
```

### 2) Jalankan backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Jalankan frontend
```bash
cd frontend
npm install
npm run setup-models
npm run dev
```

## URL default
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Catatan penting
- Browser akan meminta izin akses kamera.
- Karena file model AI tidak bisa saya bundle langsung dari environment ini, saya sertakan script `npm run setup-models` untuk mengunduh model face-api.js otomatis ke folder `frontend/public/models`.
- Setelah model terunduh sekali, aplikasi bisa langsung dipakai lokal.
- Ini cocok untuk MVP/internal system. Untuk production, sebaiknya tambah liveness detection, auth admin, enkripsi biometrik, dan audit log.
