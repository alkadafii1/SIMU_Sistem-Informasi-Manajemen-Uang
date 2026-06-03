# SIMU - Sistem Informasi Manajemen Uang

**Aplikasi pencatat dan perencana keuangan pribadi untuk generasi muda**

> **Coding Camp 2026 powered by DBS Foundation** — Tema: *Revolusi Teknologi Keuangan (Fintech) untuk Generasi Muda*

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

---

## 🎯 Tentang Aplikasi

**SIMU (Sistem Informasi Manajemen Uang)** adalah aplikasi web yang dirancang untuk membantu generasi muda dalam mengelola keuangan pribadi secara lebih terstruktur dan cerdas.

### Latar Belakang

Rendahnya tingkat literasi keuangan di Indonesia menjadi tantangan nyata, terutama bagi generasi muda yang sering kesulitan mengatur pengeluaran. Banyak individu menghabiskan uang tanpa perencanaan yang jelas, sehingga tidak memiliki tabungan yang cukup dan rentan terhadap tekanan finansial.

### Solusi yang Ditawarkan

- ✅ **Pencatatan transaksi** yang mudah dan cepat
- ✅ **Alokasi anggaran otomatis** dengan metode 50/30/20
- ✅ **Rekomendasi pengeluaran harian** yang dinamis
- ✅ **Analisis pola keuangan** menggunakan Deep Learning & Gemini AI
- ✅ **Target tabungan** untuk mencapai impian finansial

---

## ✨ Fitur Unggulan

| Modul | Fitur | Status |
|---|---|---|
| 🔐 Autentikasi | Register, Login Manual, Login dengan Google | ✅ |
| 📝 Pencatatan | Catat pemasukan & pengeluaran, CRUD transaksi | ✅ |
| 📊 Dashboard | Ringkasan keuangan, grafik pengeluaran, insight bulanan | ✅ |
| 🤖 Smart Budgeting | Alokasi otomatis 50/30/20, rekomendasi harian | ✅ |
| 🧠 AI Analytics | Prediksi kesehatan finansial & rekomendasi personal (Gemini AI) | ✅ |
| 🎯 Target Tabungan | Kelola target finansial impian, alokasi tabungan | ✅ |
| 📜 Riwayat | Filter & pagination, export CSV | ✅ |
| 🌙 Dark Mode | Tampilan nyaman siang & malam | ✅ |
| 🌐 Multi-language | Support Bahasa Indonesia & English | ✅ |

---

## 🛠 Teknologi yang Digunakan

### Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| React | 19.2.0 | Library UI |
| Vite | 8.0.12 | Build tool & dev server |
| Tailwind CSS | 3.x | Styling & utilitas CSS |
| Axios | 1.16.1 | HTTP client |
| React Router DOM | 7.15.1 | Routing |

### Backend

| Teknologi | Versi | Fungsi |
|---|---|---|
| Node.js | 22.x | Runtime |
| Express.js | 5.2.1 | Framework backend |
| Supabase | 3.x | Database PostgreSQL |
| JWT | 9.0.3 | Autentikasi |
| bcryptjs | 2.4.3 | Hash password |
| OAuth2Client | 10.6.2 | Google Login |

### AI & Data Science

| Teknologi | Fungsi |
|---|---|
| Python 3.10 | Runtime AI |
| TensorFlow | Deep Learning model |
| FastAPI | API untuk clustering & prediksi |
| Gemini AI | Generate rekomendasi personal |
| Pandas / NumPy | Data processing |
| Scikit-learn | Data scaling & preprocessing |

---

## 📁 Struktur Proyek

```
SIMU_Sistem-Informasi-Manajemen-Uang/
│
├── 📁 netlify/functions/
│   └── api.js                    # Backend utama (Express + Supabase)
│
├── 📁 src/
│   ├── 📁 components/            # Komponen React reusable
│   │   ├── 📁 Dashboard/         # Komponen dashboard
│   │   ├── 📁 Onboarding/        # Komponen onboarding
│   │   └── 📁 SetupFinancial/    # Komponen setup finansial
│   ├── 📁 constants/             # Data statis & kategori
│   ├── 📁 context/               # Context API (Theme, Language)
│   ├── 📁 hooks/                 # Custom hooks
│   ├── 📁 pages/                 # Halaman utama
│   ├── 📁 services/              # API services (axios instance)
│   └── 📁 utils/                 # Utility functions
│
├── 📁 public/                    # Aset statis
├── 📁 locales/                   # File terjemahan (id.json, en.json)
│
├── .env                          # Environment variables
├── netlify.toml                  # Konfigurasi Netlify
├── package.json                  # Dependencies frontend
├── tailwind.config.js            # Konfigurasi Tailwind CSS
├── vite.config.js                # Konfigurasi Vite
└── README.md
```

---

## 👥 Tim Pengembang

**Coding Camp 2026 powered by DBS Foundation** — ID Tim: `CC26-PSU171`

| Nama | Learning Path |
|---|---|
| Meilani Bulandari Hasibuan | Data Scientist |
| Yelly Ambarwaty | Data Scientist |
| Anisa Nabila | AI Engineer |
| Izzatul Aliya Nisa | AI Engineer |
| Celvin Alfiansyah | Full-Stack Web Developer |
| Alkadafi Firnawan | Full-Stack Web Developer |

---

## 🚀 Panduan Instalasi

### Prasyarat

| Software | Minimal Versi | Download |
|---|---|---|
| Node.js | v18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm | v9.0.0 | (termasuk Node.js) |
| Git | v2.30.0 | [git-scm.com](https://git-scm.com/) |
| Python | v3.10 | [python.org](https://python.org/) *(untuk AI Engineer)* |

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/alkadafii1/SIMU_Sistem-Informasi-Manajemen-Uang.git
cd SIMU_Sistem-Informasi-Manajemen-Uang
```

### Langkah 2 — Install Dependencies

```bash
npm install
```

### Langkah 3 — Setup Environment Variables

Buat file `.env` di root proyek:

```env
# JWT
JWT_SECRET=simu-secret-key-2026-prod

# Google OAuth (dari Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# AI API (Railway)
AI_API_URL=https://financial-health-prediction-production.up.railway.app

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Langkah 4 — Setup Database Supabase

1. Buat akun di [supabase.com](https://supabase.com) dan buat project baru bernama `simu-finance`

2. Jalankan SQL berikut di **SQL Editor**:

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
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🏃 Cara Menjalankan Aplikasi

### 1. Jalankan Backend

```bash
# Terminal 1
node netlify/functions/api.js
```

Output yang diharapkan:

```
🚀 SIMU Backend Running at http://localhost:3001

📋 Endpoints:
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

### 2. Jalankan Frontend

```bash
# Terminal 2
npm run dev
```

### 3. Buka Aplikasi

Akses di browser: [http://localhost:5173](http://localhost:5173)

---

## 📖 Cara Menggunakan

```
PENGGUNA BARU
     │
     ▼
1. ONBOARDING  →  Pilih Register atau Login
     │
     ▼
2. REGISTER / LOGIN
   - Isi nama, email, password
   - Atau login dengan Google
     │
     ▼
3. SETUP FINANSIAL  (hanya pengguna baru)
   - Masukkan pendapatan bulanan
   - Atur alokasi anggaran (50/30/20 atau custom)
   - Pilih target finansial impian
     │
     ▼
4. DASHBOARD
   - Ringkasan keuangan & grafik
   - Rekomendasi dari AI Financial Assistant
   - Batas belanja harian
     │
     ▼
5. CATAT TRANSAKSI
   - Pilih tipe: Pengeluaran / Pemasukan / Transfer
   - Masukkan nominal via number pad
   - Pilih kategori & tambahkan catatan
     │
     ▼
6. FITUR LAINNYA
   - Riwayat: filter & export CSV
   - Target Tabungan: atur target & alokasi dana
   - Pengaturan: tema, bahasa, profil
```

### API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login manual |
| POST | `/api/auth/google` | Login dengan Google |
| GET | `/api/user/setup` | Ambil data setup user |
| PUT | `/api/user/setup` | Simpan setup finansial |
| GET | `/api/transactions` | Ambil semua transaksi |
| POST | `/api/transactions` | Tambah transaksi baru |
| DELETE | `/api/transactions/:id` | Hapus transaksi |
| POST | `/api/ai/predict` | Prediksi kesehatan finansial |
| GET | `/api/ai/health` | Cek status API AI |

---

## 🔧 Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Cannot connect to localhost:3001 | Backend tidak berjalan | Jalankan `node netlify/functions/api.js` |
| Error 500 saat register | RLS Supabase aktif | Nonaktifkan RLS atau buat policy |
| Google Login gagal | `GOOGLE_CLIENT_ID` tidak valid | Set env variable & restart backend |
| Dark mode tidak berubah | ThemeProvider tidak terpasang | Pastikan `ThemeProvider` ada di `main.jsx` |
| Translation missing | Key tidak ada di JSON | Tambahkan key di `locales/id.json` atau `en.json` |

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

Proyek ini dibuat untuk keperluan portofolio pembelajaran dalam program **Coding Camp 2026 powered by DBS Foundation**. Seluruh kode bersifat open-source untuk tujuan edukasi.

---

<div align="center">

Dibuat dengan 💚 oleh Tim CC26-PSU171

**Coding Camp 2026 powered by DBS Foundation**

</div>