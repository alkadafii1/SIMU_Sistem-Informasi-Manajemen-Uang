// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// In-memory storage (stateless, untuk demo)
// TODO: Migrasi ke database
const users = [];
const transactions = [];
const monthlyBudgets = [];

const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const AI_API_URL = process.env.AI_API_URL || 'https://financial-health-prediction-production.up.railway.app';

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Inisialisasi Express app
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions' });
});

// Auth Endpoints
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

// Get current user
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

// Integrasi AI

// Helper: Map transaksi user ke format yang diminta API AI
function mapTransactionsToAIFormat(userId, monthlyIncome, userTransactions) {
  const aiRequest = {
    user_id: String(userId),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    income: monthlyIncome,
    rent: 0,
    loan_repayment: 0,
    insurance: 0,
    groceries: 0,
    transport: 0,
    eating_out: 0,
    entertainment: 0,
    utilities: 0,
    healthcare: 0,
    education: 0,
    miscellaneous: 0
  };
  
  for (const tx of userTransactions) {
    const amount = Number(tx.amount);
    if (isNaN(amount)) continue;
    
    const category = (tx.category || '').toLowerCase();
    
    if (category.includes('makanan') || category.includes('sembako') || category === 'groceries') {
      aiRequest.groceries += amount;
    } else if (category.includes('transport') || category === 'transportasi') {
      aiRequest.transport += amount;
    } else if (category.includes('makan') || category === 'eating_out' || category === 'makan di luar') {
      aiRequest.eating_out += amount;
    } else if (category.includes('hiburan') || category === 'entertainment') {
      aiRequest.entertainment += amount;
    } else if (category.includes('listrik') || category.includes('air') || category === 'utilities') {
      aiRequest.utilities += amount;
    } else if (category.includes('kesehatan') || category === 'healthcare') {
      aiRequest.healthcare += amount;
    } else if (category.includes('sewa') || category === 'rent' || category.includes('kontrakan')) {
      aiRequest.rent += amount;
    } else if (category.includes('cicilan') || category === 'loan') {
      aiRequest.loan_repayment += amount;
    } else if (category.includes('asuransi') || category === 'insurance') {
      aiRequest.insurance += amount;
    } else if (category.includes('pendidikan') || category === 'education') {
      aiRequest.education += amount;
    } else {
      aiRequest.miscellaneous += amount;
    }
  }
  
  return aiRequest;
}

// Endpoint: POST /api/ai/predict - Prediksi kesehatan finansial
app.post('/api/ai/predict', async (req, res) => {
  try {
    const { userId, monthlyIncome, month, year } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    // Ambil transaksi user
    const userTransactions = transactions.filter(t => t.userId === userId);
    
    // Ambil monthlyIncome
    let income = monthlyIncome;
    if (!income) {
      const user = users.find(u => u.id === userId);
      if (user && user.monthlyIncome) {
        income = user.monthlyIncome;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'monthlyIncome is required or set user monthlyIncome first' 
        });
      }
    }
    
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    
    const aiRequest = mapTransactionsToAIFormat(userId, income, userTransactions);
    aiRequest.month = targetMonth;
    aiRequest.year = targetYear;
    
    console.log('Calling AI API:', `${AI_API_URL}/predict-financial-health`);
    
    const aiResponse = await fetch(`${AI_API_URL}/predict-financial-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiRequest)
    });
    
    if (!aiResponse.ok) {
      throw new Error(`AI API responded with status: ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    
    res.json({
      success: true,
      prediction: {
        classId: aiData.prediction?.class_id,
        label: aiData.prediction?.label,
        confidence: aiData.prediction?.confidence
      },
      probabilities: aiData.probabilities,
      ratios: aiData.ratios,
      summary: aiData.summary,
      recommendation: aiData.recommendation,
      recommendationSource: aiData.recommendation_source
    });
    
  } catch (error) {
    console.error('AI Prediction Error:', error.message);
    
    // Fallback jika AI API error
    const { userId, monthlyIncome } = req.body;
    const userTransactions = transactions.filter(t => t.userId === userId);
    const totalExpense = userTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const income = monthlyIncome || 5000000;
    const savingsRate = (income - totalExpense) / income;
    
    let label = 'Moderate';
    let classId = 1;
    if (savingsRate > 0.3) {
      label = 'Financially Healthy';
      classId = 0;
    } else if (savingsRate < 0.1) {
      label = 'At Risk';
      classId = 2;
    }
    
    let recommendation = '';
    if (label === 'Financially Healthy') {
      recommendation = 'Keuangan Anda dalam kondisi sehat. Pertahankan kebiasaan menabung!';
    } else if (label === 'At Risk') {
      recommendation = 'Keuangan Anda perlu perhatian. Coba kurangi pengeluaran tidak penting.';
    } else {
      recommendation = 'Keuangan Anda cukup stabil. Tingkatkan tabungan dengan mengurangi pengeluaran gaya hidup.';
    }
    
    res.json({
      success: true,
      is_fallback: true,
      prediction: { classId, label, confidence: 0.65 },
      probabilities: {
        'Financially Healthy': label === 'Financially Healthy' ? 0.6 : 0.2,
        'Moderate': label === 'Moderate' ? 0.6 : 0.2,
        'At Risk': label === 'At Risk' ? 0.6 : 0.2
      },
      recommendation: recommendation + ' (Mode offline)',
      recommendationSource: 'fallback_calculator'
    });
  }
});

// Endpoint: GET /api/ai/health - Cek status AI API
app.get('/api/ai/health', async (req, res) => {
  try {
    const response = await fetch(`${AI_API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, ai_api_status: 'online', ai_response: data });
    } else {
      res.json({ success: true, ai_api_status: 'offline', message: 'AI API tidak dapat dijangkau' });
    }
  } catch (error) {
    res.json({ success: true, ai_api_status: 'offline', message: error.message });
  }
});

exports.handler = serverless(app);