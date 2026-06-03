require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi
const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key-2026-prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const AI_API_URL = process.env.AI_API_URL || 'https://financial-health-prediction-production.up.railway.app';
const USE_MOCK_AI = false;

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://simusystem.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Cache untuk AI prediction
const aiCache = new Map();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions with Supabase' });
});

// AUTH ENDPOINTS
// Register Manual
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  
  try {
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ success: false, message: 'Gagal mendaftar' });
    }
    
    const token = generateToken(newUser.id, email);
    
    res.status(201).json({
      success: true,
      user: { id: newUser.id, name, email },
      token
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login Manual
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }
  
  try {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    
    const token = generateToken(user.id, email);
    
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
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
    
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!user) {
      const dummyPassword = await bcrypt.hash('google-oauth-' + Date.now(), 10);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: name || email.split('@')[0],
          email,
          password_hash: dummyPassword,
          google_id: googleId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Google insert error:', insertError);
        return res.status(500).json({ success: false, message: 'Gagal membuat akun' });
      }
      user = newUser;
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


// USER SETUP ENDPOINTS
// Get User Setup
app.get('/api/user/setup', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const { data: userSetup, error } = await supabase
      .from('user_setups')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!userSetup) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    
    res.json({
      success: true,
      setup: {
        income: userSetup.income,
        allocation: userSetup.allocation,
        goals: userSetup.goals || []
      }
    });
    
  } catch (err) {
    console.error('Get setup error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Save User Setup
app.put('/api/user/setup', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { income, allocation, goals } = req.body;
    
    if (!income || !allocation) {
      return res.status(400).json({ success: false, message: 'Income and allocation are required' });
    }
    
    const { data: existingSetup } = await supabase
      .from('user_setups')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSetup) {
      result = await supabase
        .from('user_setups')
        .update({
          income,
          allocation,
          goals: goals || [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      result = await supabase
        .from('user_setups')
        .insert({
          user_id: userId,
          income,
          allocation,
          goals: goals || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    if (result.error) {
      console.error('Setup error:', result.error);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan setup' });
    }
    
    await supabase
      .from('users')
      .update({ monthly_income: income })
      .eq('id', userId);
    
    res.json({
      success: true,
      message: 'Setup berhasil disimpan',
      setup: { income, allocation, goals: goals || [] }
    });
    
  } catch (err) {
    console.error('Save setup error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// GOALS SETTING ENDPOINTS
// Get User Goals
app.get('/api/user/goals', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const { data: userSetup, error } = await supabase
      .from('user_setups')
      .select('goals')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Get goals error:', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ 
      success: true, 
      goals: userSetup?.goals || [] 
    });
    
  } catch (err) {
    console.error('Get goals error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Save User Goals
app.put('/api/user/goals', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { goals } = req.body;
    
    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({ success: false, message: 'Goals must be an array' });
    }
    
    const { data: existingSetup, error: findError } = await supabase
      .from('user_setups')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingSetup) {
      const { error } = await supabase
        .from('user_setups')
        .update({ 
          goals: goals,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Update goals error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save goals' });
      }
    } else {
      const { error } = await supabase
        .from('user_setups')
        .insert({
          user_id: userId,
          income: 0,
          allocation: { kebutuhan: 50, keinginan: 30, tabungan: 20 },
          goals: goals,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Insert goals error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save goals' });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Goals saved successfully',
      goals 
    });
    
  } catch (err) {
    console.error('Save goals error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// TRANSACTIONS ENDPOINTS
// Get Transactions dengan filter & pagination
app.get('/api/transactions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    // Ambil parameter filter dari query string
    const { type, startDate, endDate, limit, page } = req.query;
    const limitNum = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const offset = (pageNum - 1) * limitNum;
    
    // Build query
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Filter by type (income/expense)
    if (type && type !== 'semua') {
      query = query.eq('type', type);
    }
    
    // Filter by date range
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Order by date descending (terbaru di atas)
    query = query.order('date', { ascending: false });
    
    // Pagination
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: transactions, error, count } = await query;
    
    if (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil transaksi' });
    }
    
    res.json({ 
      success: true, 
      transactions: transactions || [],
      count: count || 0,
      page: pageNum,
      limit: limitNum
    });
    
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Create Transaction
app.post('/api/transactions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { amount, category, type, date, description } = req.body;
    
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        category,
        type,
        date: date || new Date().toISOString().split('T')[0],
        description: description || category,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert transaction error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menambah transaksi' });
    }
    
    res.status(201).json({ success: true, transaction: newTransaction });
    
  } catch (err) {
    console.error('Post transaction error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Delete Transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const transactionId = parseInt(req.params.id);
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Delete transaction error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
    }
    
    res.json({ success: true, message: 'Transaction deleted' });
    
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// AI ENDPOINTS
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

app.post('/api/ai/predict', async (req, res) => {
  const { userId, monthlyIncome } = req.body;
  
  const { data: userTransactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  
  const cacheKey = `${userId}_${monthlyIncome}`;
  
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
    
    aiCache.set(cacheKey, { data: mockResponse, timestamp: Date.now() });
    return res.json(mockResponse);
  }
  
  let controller = null;
  try {
    const aiRequest = mapToAIRequest(userId, monthlyIncome, userTransactions || []);
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
    
    aiCache.set(cacheKey, { data: fallbackResponse, timestamp: Date.now() });
    res.json(fallbackResponse);
  }
});

// Export untuk Netlify Functions
module.exports.handler = serverless(app);

// Run Local
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
    console.log(`   GET  /api/user/goals`);
    console.log(`   PUT  /api/user/goals`);
    console.log(`   GET  /api/transactions (dengan filter & pagination)`);
    console.log(`   POST /api/transactions`);
    console.log(`   DELETE /api/transactions/:id`);
    console.log(`\n🤖 AI Mode: ${USE_MOCK_AI ? 'MOCK' : 'REAL (Railway)'}`);
    console.log(`\n🗄️  Database: Supabase (${supabaseUrl?.substring(0, 30)}...)\n`);
  });
}