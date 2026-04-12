# EthicAdvidsor

Platform compliance FinTech ESG - OJK - SDG

## Tech Stack
- Frontend: React + Vite + Tailwind CSS v4
- Backend: Laravel 13.3.0 + Sanctum
- Database: MySQL

## Setup Backend
1. Masuk ke folder backend: `cd backend`
2. Install dependencies: `composer install`
3. Copy env: `cp .env.example .env`
4. Generate key: `php artisan key:generate`
5. Buat database: `ethicadvidsor_db`
6. Jalankan migration: `php artisan migrate`
7. Jalankan server: `php artisan serve`

## Setup Frontend
1. Masuk ke folder frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Jalankan dev server: `npm run dev`

## Struktur Folder Frontend
src/
├── api/          → axios instance (jangan diubah yak!)
├── components/   → komponen reusable
├── context/      → AuthContext (ini juga sama, jangan diubah!)
├── pages/        → halaman-halaman website
│   └── admin/    → halaman admin
└── utils/        → ProtectedRoute (ini juga jangan diubah!)

## Halaman yang sudah selesai
- LoginPage.jsx
- RegisterPage.jsx
- Dashboard.jsx

## Halaman yang perlu dikerjakan
- LandingPage.jsx
- ForgotPasswordPage.jsx
- UploadPage.jsx
- ResultPage.jsx
- ESGReportPage.jsx
- OJKStatusPage.jsx
- NotificationsPage.jsx
- admin/AdminDashboard.jsx