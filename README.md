# SIMU - Sistem Informasi Manajemen Uang

**Aplikasi pencatat dan perencana keuangan pribadi untuk generasi muda**

> **Coding Camp 2026 powered by DBS Foundation** – Tema: *Revolusi Teknologi Keuangan (Fintech) untuk Generasi Muda*

![Version](https://img.shields.io/badge/Version-1.0.0-00685f?style=flat-square)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-3.x-3FCF8E?style=flat-square&logo=supabase)

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Fitur Unggulan](#-fitur-unggulan)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Proyek](#-struktur-proyek)
- [Tim Pengembang](#-tim-pengembang)
- [Panduan Instalasi](#-panduan-instalasi)
- [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [Cara Menggunakan](#-cara-menggunakan)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Aplikasi

**SIMU (Sistem Informasi Manajemen Uang)** adalah aplikasi web yang dirancang untuk membantu generasi muda dalam mengelola keuangan pribadi secara lebih terstruktur.

### Latar Belakang

Rendahnya tingkat literasi keuangan di Indonesia menjadi tantangan nyata, terutama bagi generasi muda yang sering mengalami kesulitan dalam mengelola keuangan. Banyak individu cenderung menghabiskan uang tanpa perencanaan yang jelas, sehingga tidak memiliki tabungan yang cukup dan rentan terhadap tekanan finansial.

### Solusi yang Ditawarkan

- ✅ **Pencatatan transaksi** yang mudah dan cepat
- ✅ **Alokasi anggaran otomatis** dengan metode 50/30/20 atau custom
- ✅ **Rekomendasi pengeluaran harian** yang dinamis
- ✅ **Analisis pola keuangan** menggunakan Deep Learning & Gemini AI
- ✅ **Target tabungan** untuk mencapai impian finansial

---

## ✨ Fitur Unggulan

| Modul | Fitur | Status |
|-------|-------|--------|
| 🔐 Autentikasi | Register, Login Manual, Login dengan Google | ✅ |
| 📝 Pencatatan | Catat pemasukan & pengeluaran, CRUD transaksi, Transfer ke Tabungan, Tarik dari Tabungan | ✅ |
| 📊 Dashboard | Ringkasan keuangan, grafik pengeluaran, insight bulanan, Saldo Aktif & Saldo Tabungan | ✅ |
| 🤖 Smart Budgeting | Alokasi otomatis 50/30/20, rekomendasi harian | ✅ |
| 🧠 AI Analytics | Prediksi kesehatan finansial & rekomendasi personal (Gemini AI) | ✅ |
| 🎯 Target Tabungan | Kelola target finansial impian, alokasi dana dari Tabungan Umum | ✅ |
| 📜 Riwayat | Filter (tipe, waktu), pagination, export CSV | ✅ |
| 🌙 Dark Mode | Tampilan nyaman siang & malam | ✅ |
| 🌐 Multi-language | Support Bahasa Indonesia & English | ✅ |

---

## 🛠 Teknologi yang Digunakan

### Frontend (React + Vite)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 19.2.0 | Library UI |
| Vite | 8.0.12 | Build tool & dev server |
| Tailwind CSS | 3.x | Styling & utilitas CSS |
| Axios | 1.16.1 | HTTP client untuk panggil API |
| React Router DOM | 7.15.1 | Routing antar halaman |

### Backend (Node.js + Express)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 22.x | JavaScript runtime |
| Express.js | 5.2.1 | Framework backend (di Netlify Functions) |
| Supabase | 3.x | Database PostgreSQL (cloud) |
| jsonwebtoken | 9.0.3 | Generate & verifikasi JWT untuk autentikasi |
| bcryptjs | 2.4.3 | Hash password (enkripsi) |
| google-auth-library | 10.6.2 | Verifikasi token Google Login |
| dotenv | 17.4.2 | Load environment variables dari .env |
| node-fetch | 2.x | HTTP client untuk panggil API AI Railway |
| serverless-http | 4.0.0 | Wrapper Express untuk Netlify Functions |

### AI & Data Science (Tim AI Engineer)

| Teknologi | Fungsi |
|-----------|--------|
| Python 3.10 | Runtime AI |
| TensorFlow | Deep Learning model (clustering) |
| FastAPI | API untuk endpoint prediksi |
| Gemini AI | Generate rekomendasi personal |
| joblib | Load model & scaler yang sudah dilatih |
| pandas / numpy | Data processing |

---

## 📁 Struktur Proyek

```
SIMU_Sistem-Informasi-Manajemen-Uang/
│
├── 📁 netlify/
│   └── 📁 functions/
│       └── api.js                  # BACKEND UTAMA (Express + Supabase)
│                                   # Semua endpoint: auth, user, transactions, AI
│
├── 📁 src/                         # FRONTEND REACT
│   │
│   ├── 📁 components/              # Komponen reusable
│   │   ├── 📁 Dashboard/           # Komponen dashboard (SummaryCards, AICard, dll)
│   │   ├── 📁 Onboarding/          # Komponen onboarding (Step1, Step2, Step3)
│   │   ├── 📁 SetupFinancial/      # Komponen setup finansial
│   │   └── Sidebar.jsx             # Sidebar navigasi (desktop + mobile bottom nav)
│   │
│   ├── 📁 constants/               # Data statis
│   │   ├── categories.js           # Daftar kategori transaksi (Needs/Wants)
│   │   ├── onboardingData.js       # Data onboarding (fitur, alokasi, dll)
│   │   └── setupData.js            # Data setup finansial (GOALS_OPTIONS, warna)
│   │
│   ├── 📁 context/                 # Context API global state
│   │   ├── ThemeContext.jsx        # Dark/light mode state
│   │   └── LanguageContext.jsx     # Multi-language state (ID/EN)
│   │
│   ├── 📁 hooks/                   # Custom hooks
│   │   ├── 📁 dashboard/           # Hooks spesifik dashboard
│   │   │   ├── useAIPrediction.js  # Fetch & cache AI prediction
│   │   │   ├── useDashboardData.js # Fetch data dashboard (setup, transactions)
│   │   │   └── usePopup.js         # Welcome popup dengan timer progress
│   │   └── useThemeStyles.js       # Styling berdasarkan dark/light mode
│   │
│   ├── 📁 locales/                 # File terjemahan
│   │   ├── id.json                 # Bahasa Indonesia
│   │   └── en.json                 # Bahasa English
│   │
│   ├── 📁 pages/                   # Halaman utama aplikasi
│   │   ├── Login.jsx               # Halaman login (manual + Google)
│   │   ├── Register.jsx            # Halaman registrasi
│   │   ├── Onboarding.jsx          # Halaman onboarding (3 step)
│   │   ├── SetupFinancial.jsx      # Setup pendapatan & alokasi (FIRST TIME)
│   │   ├── Dashboard.jsx           # Dashboard utama
│   │   ├── TransactionPage.jsx     # Catat transaksi (pengeluaran/pemasukan/transfer)
│   │   ├── HistoryPage.jsx         # Riwayat transaksi dengan filter & pagination
│   │   ├── StatisticsPage.jsx      # Statistik & analisis keuangan
│   │   ├── GoalsSetting.jsx        # Atur target tabungan
│   │   ├── SettingsPage.jsx        # Pengaturan aplikasi (tema, bahasa)
│   │   ├── ProfilePage.jsx         # Edit profil user
│   │   └── AboutPage.jsx           # Informasi aplikasi & tim pengembang
│   │
│   ├── 📁 services/
│   │   └── api.js                  # Axios instance (baseURL, interceptor token)
│   │
│   ├── 📁 utils/                   # Utility functions
│   │   ├── format.js               # formatRupiah()
│   │   └── 📁 dashboard/
│   │       ├── greeting.js         # getGreeting() berdasarkan waktu
│   │       └── aiHelpers.js        # getStatusColor, getStatusIcon, getStatusText
│   │
│   ├── App.jsx                     # Routing utama (React Router)
│   ├── main.jsx                    # Entry point (ThemeProvider, LanguageProvider)
│   └── index.css                   # Global styles
│
├── .env                            # Environment variables (JWT, Supabase, Google)
├── .env.example                    # Contoh environment variables
├── netlify.toml                    # Konfigurasi deploy Netlify
├── package.json                    # Dependencies frontend
├── vite.config.js                  # Konfigurasi Vite (proxy untuk development)
└── README.md
```

---

## 👥 Tim Pengembang

**Coding Camp 2026 powered by DBS Foundation**
**ID Tim Capstone:** CC26-PSU171

| Nama | Learning Path |
|------|---------------|
| Meilani Bulandari Hasibuan | Data Scientist |
| Yelly Ambarwaty | Data Scientist |
| Anisa Nabila | AI Engineer | Model
| Izzatul Aliya Nisa | AI Engineer |
| Celvin Alfiansyah | Full-Stack Web Developer |
| Alkadafi Firnawan | Full-Stack Web Developer |

---

## 🚀 Panduan Instalasi

### Prasyarat

| Software | Minimal Versi | Download |
|----------|---------------|----------|
| Node.js | v18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm | v9.0.0 | (termasuk Node.js) |
| Git | v2.30.0 | [git-scm.com](https://git-scm.com/) |

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/alkadafii1/SIMU_Sistem-Informasi-Manajemen-Uang.git
cd SIMU_Sistem-Informasi-Manajemen-Uang
```

### Langkah 2 — Install Dependencies Frontend

```bash
npm install
```

### Langkah 3 — Install Dependencies Backend

```bash
npm install express serverless-http cors bcryptjs jsonwebtoken google-auth-library @supabase/supabase-js dotenv node-fetch
```

| Package | Fungsi |
|---------|--------|
| express | Framework web untuk backend |
| serverless-http | Wrapper Express untuk Netlify Functions |
| cors | Mengatasi CORS issue |
| bcryptjs | Hashing password |
| jsonwebtoken | Generate token autentikasi |
| google-auth-library | Verifikasi token Google |
| @supabase/supabase-js | Client untuk koneksi ke Supabase |
| dotenv | Load environment variables |
| node-fetch | HTTP client untuk panggil API AI Railway |

### Langkah 4 — Setup Environment Variables

Buat file `.env` di root proyek:

```env
# Wajib (Backend & Database)
JWT_SECRET=simu-secret-key-2026-prod
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Opsional (Google Login & AI)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
AI_API_URL=https://financial-health-prediction-production.up.railway.app

# Opsional (Frontend - untuk Google Login)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Langkah 5 — Setup Database Supabase

1. Buat akun di [supabase.com](https://supabase.com) dan buat project baru bernama `simu-finance`

2. Buka **SQL Editor** dan jalankan query berikut:

```sql
-- Tabel users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(100),
  monthly_income DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel user_setups
CREATE TABLE user_setups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  income DECIMAL(15,2),
  allocation JSONB,
  goals JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2),
  category VARCHAR(50),
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nonaktifkan RLS untuk development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_setups DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

3. Dapatkan credentials dari **Project Settings → API**:
   - `Project URL` → isi ke `SUPABASE_URL`
   - `service_role key` → isi ke `SUPABASE_SERVICE_ROLE_KEY`

---

## 🏃 Cara Menjalankan Aplikasi

### Terminal 1 — Jalankan Backend

```bash
# Windows PowerShell
$env:PORT=3001; node netlify/functions/api.js

# Mac / Linux
PORT=3001 node netlify/functions/api.js
```

Output yang diharapkan:

```
🚀 SIMU Backend Running at http://localhost:3001

📋 Endpoints:
   GET  /api/health
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/google
   GET  /api/user/setup
   PUT  /api/user/setup
   GET  /api/transactions
   POST /api/transactions
   DELETE /api/transactions/:id
   POST /api/ai/predict
   GET  /api/ai/health

🤖 AI Mode: REAL (Railway)
🗄️  Database: Supabase connected
```

### Terminal 2 — Jalankan Frontend

```bash
npm run dev
```

### Buka Aplikasi

Akses di browser: **http://localhost:5173**

---

## 📖 Cara Menggunakan

### Alur Pengguna

```
PENGGUNA BARU
      │
      ▼
1. ONBOARDING
   → Pilih "Mulai Sekarang" → Register atau Login
      │
      ▼
2. REGISTER
   - Isi nama, email, password
   - Centang syarat & ketentuan
      │
      ▼
3. LOGIN
   - Masukkan email & password
   - Atau login dengan Google
      │
      ▼
4. SETUP FINANSIAL  (hanya untuk pengguna baru)
   - Masukkan pendapatan bulanan
   - Atur alokasi anggaran (50/30/20 atau custom)
   - Pilih target finansial impian
      │
      ▼
5. DASHBOARD
   - Ringkasan keuangan (Saldo Aktif & Saldo Tabungan)
   - Rekomendasi dari AI Financial Assistant (Gemini AI)
   - Batas belanja harian & alokasi Needs/Wants/Savings
      │
      ▼
6. CATAT TRANSAKSI
   - Pilih tipe: Pengeluaran / Pemasukan / Transfer
   - Masukkan nominal via number pad
   - Pilih kategori & tambahkan catatan (opsional)
      │
      ▼
7. FITUR LAINNYA
   - Riwayat: filter, pagination, export CSV
   - Target Tabungan: atur target & alokasi dari Tabungan Umum
   - Pengaturan: dark mode, bahasa, edit profil
```

### API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login manual |
| POST | `/api/auth/google` | Login dengan Google |
| GET | `/api/user/setup` | Ambil data setup user |
| PUT | `/api/user/setup` | Simpan setup finansial |
| GET | `/api/transactions` | Ambil transaksi (filter, pagination, sort) |
| POST | `/api/transactions` | Tambah transaksi baru |
| DELETE | `/api/transactions/:id` | Hapus transaksi |
| POST | `/api/ai/predict` | Prediksi kesehatan finansial |
| GET | `/api/ai/health` | Cek status API AI |

---

## 🔧 Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---------|----------------------|--------|
| Cannot connect to localhost:3001 | Backend tidak berjalan | Jalankan `node netlify/functions/api.js` |
| Error 500 "violates row-level security" | RLS Supabase aktif | Jalankan `ALTER TABLE users DISABLE ROW LEVEL SECURITY;` |
| Google Login gagal (401) | `GOOGLE_CLIENT_ID` tidak valid | Set environment variable & restart backend |
| Translation missing for key: xxx | Key tidak ada di JSON | Tambahkan key di `locales/id.json` atau `en.json` |
| Dark mode tidak berubah | ThemeProvider tidak terpasang | Pastikan `ThemeProvider` ada di `main.jsx` |
| AI Prediction error 502 | API Railway sedang offline | Tunggu beberapa saat atau cek status Railway |

**Tips debugging:**

```bash
# Cek status backend
curl http://localhost:3001/api/health

# Cek log di terminal backend untuk error detail
# Cek Console browser (F12) untuk error frontend
```

---

## 📄 Lisensi

Hak Cipta © 2026 Tim CC26-PSU171

Proyek ini dibuat untuk keperluan portofolio pembelajaran dalam program **Coding Camp 2026 powered by DBS Foundation**. Seluruh kode dan aset dalam proyek ini bersifat open-source untuk tujuan edukasi.

<div align="center">

Dibuat oleh Tim CC26-PSU171

**Coding Camp 2026 powered by DBS Foundation**

</div>