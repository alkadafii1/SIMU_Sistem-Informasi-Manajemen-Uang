// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// ==================== KONFIGURASI ====================
const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key-2026-prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const AI_API_URL = process.env.AI_API_URL || 'https://financial-health-prediction-production.up.railway.app';
const USE_MOCK_AI = false;

// Helper function
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// ==================== IN-MEMORY STORAGE ====================
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

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions' });
});

// ==================== AUTH MANUAL ====================
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

// ==================== GOOGLE LOGIN ====================
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

// ==================== USER SETUP ====================
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

// ==================== TRANSACTIONS ====================
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

// ==================== AI ENDPOINTS ====================
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
    const response = await fetch(`${AI_API_URL}/health`);
    const data = await response.json();
    res.json({ success: true, ai_api_status: 'online', ai_response: data });
  } catch (error) {
    res.json({ success: true, ai_api_status: 'offline', message: error.message });
  }
});

app.post('/api/ai/predict', async (req, res) => {
  const { userId, monthlyIncome } = req.body;
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  if (USE_MOCK_AI) {
    console.log('[MOCK] Predict for user', userId);
    let label = 'Moderate';
    if (monthlyIncome >= 10000000) label = 'Financially Healthy';
    else if (monthlyIncome <= 3000000) label = 'At Risk';
    
    return res.json({
      success: true,
      is_mock: true,
      prediction: { label, confidence: 0.85 },
      recommendation: `(Mock) ${label === 'At Risk' ? 'Perhatikan keuangan Anda.' : 'Keuangan Anda sehat.'}`,
      source: 'mock_ai'
    });
  }
  
  try {
    const aiRequest = mapToAIRequest(userId, monthlyIncome, userTransactions);
    console.log('[REAL AI] Calling API...');
    
    const response = await fetch(`${AI_API_URL}/predict-financial-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiRequest)
    });
    
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    
    const aiData = await response.json();
    
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
      source: aiData.recommendation_source || 'ai_api'
    });
    
  } catch (error) {
    console.error('[REAL AI] Error:', error.message);
    res.json({
      success: true,
      is_fallback: true,
      prediction: { label: 'Moderate', confidence: 0.5 },
      recommendation: 'AI sedang sibuk, ini rekomendasi sementara: catat semua pengeluaran Anda.',
      source: 'fallback'
    });
  }
});

// Export
module.exports.handler = serverless(app);