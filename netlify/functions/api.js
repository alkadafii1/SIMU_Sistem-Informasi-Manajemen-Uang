require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Konfigurasi
const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key-2026-prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const AI_API_URL = process.env.AI_API_URL || 'https://financial-health-prediction-production.up.railway.app';
const USE_MOCK_AI = false;

// Helper function
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// In-memory Storage
const users = [];
const transactions = [];
global.userSetups = [];

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://simusystem.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions' });
});

// Auth Manual
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const newUser = { 
    id: users.length + 1, 
    name, 
    email, 
    passwordHash,
    createdAt: new Date().toISOString() 
  };
  users.push(newUser);
  
  const token = generateToken(newUser.id, email);
  
  res.status(201).json({ 
    success: true, 
    user: { id: newUser.id, name, email }, 
    token 
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  }
  
  const token = generateToken(user.id, email);
  
  res.json({ 
    success: true, 
    user: { id: user.id, name: user.name, email: user.email }, 
    token 
  });
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    console.log('[Google] Login attempt, token length:', idToken?.length);
    
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token tidak ditemukan' });
    }
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.error('[Google] Invalid GOOGLE_CLIENT_ID');
      return res.status(500).json({ success: false, message: 'Konfigurasi Google Login belum lengkap' });
    }
    
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    console.log('[Google] Verified email:', email);
    
    let user = users.find(u => u.email === email);
    
    if (!user) {
      const dummyPassword = await bcrypt.hash('google-oauth-' + Date.now(), 10);
      user = { 
        id: users.length + 1, 
        name: name || email.split('@')[0], 
        email, 
        passwordHash: dummyPassword, 
        googleId: googleId,
        createdAt: new Date().toISOString() 
      };
      users.push(user);
      console.log('[Google] New user created:', email);
    }
    
    const token = generateToken(user.id, user.email);
    
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email }, 
      token 
    });
    
  } catch (error) {
    console.error('[Google] Error:', error.message);
    res.status(401).json({ success: false, message: 'Verifikasi Google gagal: ' + error.message });
  }
});

// User Setup
app.get('/api/user/setup', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const userSetup = global.userSetups?.find(us => us.userId === userId);
    
    if (!userSetup) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    
    res.json({ 
      success: true, 
      setup: {
        income: userSetup.income,
        allocation: userSetup.allocation
      }
    });
    
  } catch (err) {
    console.error('Get setup error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.put('/api/user/setup', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { income, allocation } = req.body;
    
    if (!income || !allocation) {
      return res.status(400).json({ success: false, message: 'Income and allocation are required' });
    }
    
    if (!global.userSetups) {
      global.userSetups = [];
    }
    
    const existingIndex = global.userSetups.findIndex(us => us.userId === userId);
    
    if (existingIndex >= 0) {
      global.userSetups[existingIndex] = {
        ...global.userSetups[existingIndex],
        income,
        allocation,
        updatedAt: new Date().toISOString()
      };
    } else {
      global.userSetups.push({
        userId,
        income,
        allocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
      user.monthlyIncome = income;
    }
    
    res.json({ 
      success: true, 
      message: 'Setup berhasil disimpan',
      setup: { income, allocation }
    });
    
  } catch (err) {
    console.error('Save setup error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Transactions
app.get('/api/transactions', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userTransactions = transactions.filter(t => t.userId === decoded.userId);
    res.json({ success: true, transactions: userTransactions });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.post('/api/transactions', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { amount, category, type, date, description } = req.body;
    
    const newTransaction = {
      id: transactions.length + 1,
      userId: decoded.userId,
      amount,
      category,
      type,
      date: date || new Date().toISOString().split('T')[0],
      description: description || category,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    res.status(201).json({ success: true, transaction: newTransaction });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const transactionId = parseInt(req.params.id);
    const transactionIndex = transactions.findIndex(t => t.id === transactionId && t.userId === decoded.userId);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    transactions.splice(transactionIndex, 1);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// AI Endpoints
function mapToAIRequest(userId, monthlyIncome, userTransactions) {
  let groceries = 0, transport = 0, eating_out = 0, entertainment = 0;
  let utilities = 0, healthcare = 0, rent = 0, loan_repayment = 0;
  let insurance = 0, education = 0, miscellaneous = 0;
  
  for (const tx of userTransactions) {
    const amount = Number(tx.amount);
    if (isNaN(amount)) continue;
    const category = (tx.category || '').toLowerCase();
    
    if (category.includes('makanan') || category.includes('groceries')) groceries += amount;
    else if (category.includes('transport')) transport += amount;
    else if (category.includes('makan') || category === 'eating_out') eating_out += amount;
    else if (category.includes('hiburan') || category === 'entertainment') entertainment += amount;
    else if (category.includes('listrik') || category === 'utilities') utilities += amount;
    else if (category.includes('kesehatan') || category === 'healthcare') healthcare += amount;
    else if (category.includes('sewa') || category === 'rent') rent += amount;
    else if (category.includes('cicilan') || category === 'loan') loan_repayment += amount;
    else if (category.includes('asuransi') || category === 'insurance') insurance += amount;
    else if (category.includes('pendidikan') || category === 'education') education += amount;
    else miscellaneous += amount;
  }
  
  return {
    user_id: String(userId),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    income: monthlyIncome,
    rent, loan_repayment, insurance,
    groceries, transport, eating_out,
    entertainment, utilities, healthcare,
    education, miscellaneous
  };
}

app.get('/api/ai/health', async (req, res) => {
  if (USE_MOCK_AI) {
    return res.json({ success: true, ai_api_status: 'mock_mode', message: 'Using mock AI' });
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${AI_API_URL}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ success: true, ai_api_status: 'online', ai_response: data });
  } catch (error) {
    console.error('[AI Health] Error:', error.message);
    res.json({ success: true, ai_api_status: 'offline', message: error.message });
  }
});

// Cache untuk AI prediction
const aiCache = new Map();

app.post('/api/ai/predict', async (req, res) => {
  const { userId, monthlyIncome } = req.body;
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  // Buat cache key
  const cacheKey = `${userId}_${monthlyIncome}`;
  
  // Cek cache (valid selama 5 menit)
  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) {
      console.log('[CACHE] Returning cached prediction');
      return res.json(cached.data);
    }
  }
  
  if (USE_MOCK_AI) {
    console.log('[MOCK] Predict for user', userId);
    let label = 'Moderate';
    if (monthlyIncome >= 10000000) label = 'Financially Healthy';
    else if (monthlyIncome <= 3000000) label = 'At Risk';
    
    const mockResponse = {
      success: true,
      is_mock: true,
      prediction: { label, confidence: 0.85 },
      recommendation: `(Mock) ${label === 'At Risk' ? 'Perhatikan keuangan Anda.' : 'Keuangan Anda sehat.'}`,
      source: 'mock_ai'
    };
    
    // Simpan ke cache
    aiCache.set(cacheKey, { data: mockResponse, timestamp: Date.now() });
    
    return res.json(mockResponse);
  }
  
  let controller = null;
  try {
    const aiRequest = mapToAIRequest(userId, monthlyIncome, userTransactions);
    console.log('[REAL AI] Calling API...');
    
    controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${AI_API_URL}/predict-financial-health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(aiRequest),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`[REAL AI] API responded with status: ${response.status} ${response.statusText}`);
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }
    
    const aiData = await response.json();
    
    const responseData = {
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
      source: aiData.recommendation_source || 'ai_api'
    };
    
    // Simpan ke cache
    aiCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    res.json(responseData);
    
  } catch (error) {
    if (controller) {
      clearTimeout(controller.signal?._events);
    }
    console.error('[REAL AI] Error:', error.message);
    
    const fallbackResponse = {
      success: true,
      is_fallback: true,
      prediction: { label: 'Moderate', confidence: 0.5 },
      recommendation: 'AI sedang sibuk, ini rekomendasi sementara: catat semua pengeluaran Anda.',
      source: 'fallback'
    };
    
    // Simpan fallback ke cache juga untuk mencegah spam
    aiCache.set(cacheKey, { data: fallbackResponse, timestamp: Date.now() });
    
    res.json(fallbackResponse);
  }
});

// Export untuk Netlify Functions
module.exports.handler = serverless(app);

// Run Lokal
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 SIMU Backend Running at http://localhost:${PORT}`);
    console.log(`\n📋 Endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/ai/health`);
    console.log(`   POST /api/ai/predict`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/google`);
    console.log(`   GET  /api/user/setup`);
    console.log(`   PUT  /api/user/setup`);
    console.log(`   GET  /api/transactions`);
    console.log(`   POST /api/transactions`);
    console.log(`   DELETE /api/transactions/:id`);
    console.log(`\n🤖 AI Mode: ${USE_MOCK_AI ? 'MOCK' : 'REAL (Railway)'}\n`);
  });
}