// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// In-memory storage (perhatikan: setiap request baru, data tidak persist antar fungsi)
// Karena Netlify Functions stateless, kita perlu simpan data di database jika ingin persist.
// Tapi untuk demo awal, array akan kosong setiap kali fungsi di-reload.
// Sementara kita tetap gunakan array global (tidak persist antar invocations).
// Lebih baik nanti migrasi ke database (misal MongoDB Atlas atau Supabase free tier).
const users = [];
const transactions = [];
const monthlyBudgets = [];

const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Inisialisasi Express app
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    const existing = users.find(u => u.email === email);
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, email, passwordHash, createdAt: new Date().toISOString() };
    users.push(newUser);
    const token = generateToken(newUser.id, newUser.email);
    res.status(201).json({ success: true, user: { id: newUser.id, name, email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login manual
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Email atau password salah' });
    const token = generateToken(user.id, user.email);
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Google login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'ID token tidak ditemukan' });
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    let user = users.find(u => u.email === email);
    if (!user) {
      const dummyPassword = await bcrypt.hash('google-oauth-' + Date.now(), 10);
      user = { id: users.length + 1, name: name || email.split('@')[0], email, passwordHash: dummyPassword, googleId, createdAt: new Date().toISOString() };
      users.push(user);
    }
    const token = generateToken(user.id, user.email);
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Google login gagal' });
  }
});

// Get current user (dummy)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Tambahkan endpoint lain seperti /api/transactions, /api/monthly, dll. (salin dari backend asli)
// Karena panjang, saya akan ringkas sebagai contoh. Kamu bisa salin semua controller ke sini.

// Handler untuk Netlify Functions
exports.handler = serverless(app);