require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key-2026-prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const AI_API_URL = process.env.AI_API_URL || 'https://financial-health-prediction-production.up.railway.app';
const USE_MOCK_AI = false;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(amount);
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://simusystem.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const aiCache = new Map();

// HELPER 
// Helper function 
async function updateSavingsGeneral(userId, delta) {
  const { data: savings, error: getError } = await supabase
    .from('savings_general')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (getError) throw getError;

  if (savings) {
    const newBalance = Number(savings.balance) + delta;
    if (newBalance < 0) {
      throw new Error(`Saldo tidak mencukupi! Tersedia: ${formatRupiah(savings.balance)}`);
    }
    
    const { error: updateError } = await supabase
      .from('savings_general')
      .update({ balance: newBalance })
      .eq('user_id', userId);
    if (updateError) throw updateError;
    return newBalance;
  } else {
    if (delta < 0) throw new Error('Saldo tidak mencukupi!');
    
    const { error: insertError } = await supabase
      .from('savings_general')
      .insert({ user_id: userId, balance: delta });
    if (insertError) throw insertError;
    return delta;
  }
}

// Health Check

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running on Netlify Functions with Supabase' });
});

// Auth

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  try {
    const { data: existingUser } = await supabase
      .from('users').select('id').eq('email', email).single();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ name, email, password_hash: passwordHash, created_at: new Date().toISOString() })
      .select().single();
    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ success: false, message: 'Gagal mendaftar' });
    }

    const { error: savingsError } = await supabase
      .from('savings_general')
      .insert({ user_id: newUser.id, balance: 0 });
    if (savingsError) console.error('Savings init error:', savingsError);

    const token = generateToken(newUser.id, email);
    res.status(201).json({ success: true, user: { id: newUser.id, name, email }, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }
  try {
    const { data: user } = await supabase
      .from('users').select('*').eq('email', email).single();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const token = generateToken(user.id, email);
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token tidak ditemukan' });
    }
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return res.status(500).json({ success: false, message: 'Konfigurasi Google Login belum lengkap' });
    }
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let { data: user } = await supabase
      .from('users').select('*').eq('email', email).single();
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
        .select().single();
      if (insertError) {
        console.error('Google insert error:', insertError);
        return res.status(500).json({ success: false, message: 'Gagal membuat akun' });
      }
      user = newUser;
      const { error: savingsError } = await supabase
        .from('savings_general')
        .insert({ user_id: user.id, balance: 0 });
      if (savingsError) console.error('Savings init error:', savingsError);
    }
    const token = generateToken(user.id, user.email);
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('[Google] Error:', error.message);
    res.status(401).json({ success: false, message: 'Verifikasi Google gagal: ' + error.message });
  }
});

// User Setup

app.get('/api/user/setup', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: userSetup } = await supabase
      .from('user_setups').select('*').eq('user_id', userId).single();
    if (!userSetup) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    res.json({
      success: true,
      setup: { income: userSetup.income, allocation: userSetup.allocation, goals: userSetup.goals || [] }
    });
  } catch (err) {
    console.error('Get setup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/user/setup', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { income, allocation, goals } = req.body;
  if (!income || !allocation) {
    return res.status(400).json({ success: false, message: 'Income and allocation are required' });
  }
  try {
    const { data: existingSetup } = await supabase
      .from('user_setups').select('id').eq('user_id', userId).single();
    let result;
    if (existingSetup) {
      result = await supabase
        .from('user_setups')
        .update({ income, allocation, goals: goals || [], updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      result = await supabase
        .from('user_setups')
        .insert({
          user_id: userId, income, allocation, goals: goals || [],
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
    }
    if (result.error) {
      console.error('Setup error:', result.error);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan setup' });
    }
    await supabase.from('users').update({ monthly_income: income }).eq('id', userId);
    res.json({ success: true, message: 'Setup berhasil disimpan', setup: { income, allocation, goals: goals || [] } });
  } catch (err) {
    console.error('Save setup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Goals

app.get('/api/user/goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: userSetup, error } = await supabase
      .from('user_setups').select('goals').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') {
      console.error('Get goals error:', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, goals: userSetup?.goals || [] });
  } catch (err) {
    console.error('Get goals error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/user/goals', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { goals } = req.body;
  if (!goals || !Array.isArray(goals)) {
    return res.status(400).json({ success: false, message: 'Goals must be an array' });
  }
  try {
    const { data: existingSetup } = await supabase
      .from('user_setups').select('id').eq('user_id', userId).single();
    if (existingSetup) {
      const { error } = await supabase
        .from('user_setups')
        .update({ goals, updated_at: new Date().toISOString() })
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
          goals,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (error) {
        console.error('Insert goals error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save goals' });
      }
    }
    res.json({ success: true, message: 'Goals saved successfully', goals });
  } catch (err) {
    console.error('Save goals error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Savings

app.get('/api/savings/balance', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: general, error: genError } = await supabase
      .from('savings_general').select('balance').eq('user_id', userId).maybeSingle();
    if (genError) throw genError;

    const { data: goals, error: goalError } = await supabase
      .from('savings_goals').select('goal_id, allocated_amount').eq('user_id', userId);
    if (goalError) throw goalError;

    res.json({ success: true, generalBalance: general?.balance || 0, goals: goals || [] });
  } catch (err) {
    console.error('Get savings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/savings/topup', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  // Paksa Number untuk antisipasi string dari body
  const amount = Number(req.body.amount);
  const { date } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal tidak valid' });
  }
  try {
    const newBalance = await updateSavingsGeneral(userId, amount);
    const { error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, amount, category: 'Transfer ke Tabungan', type: 'expense',
        date: date || new Date().toISOString().split('T')[0],
        description: 'Topup Tabungan Umum',
        created_at: new Date().toISOString()
      });
    if (transError) throw transError;
    console.log(`✅ Topup ${formatRupiah(amount)} user ${userId}, saldo baru: ${formatRupiah(newBalance)}`);
    res.json({ success: true, message: 'Berhasil topup tabungan', balance: newBalance });
  } catch (error) {
    console.error('Topup error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal topup tabungan: ' + error.message });
  }
});

app.post('/api/savings/withdraw', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const amount = Number(req.body.amount);
  const { date } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Nominal tidak valid' });
  }
  try {
    const newBalance = await updateSavingsGeneral(userId, -amount);
    const { error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, amount, category: 'Tarik dari Tabungan', type: 'income',
        date: date || new Date().toISOString().split('T')[0],
        description: 'Tarik dari Tabungan Umum',
        created_at: new Date().toISOString()
      });
    if (transError) throw transError;
    res.json({ success: true, message: 'Berhasil menarik dana', balance: newBalance });
  } catch (error) {
    console.error('Withdraw error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/savings/allocate-to-goal', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { goalId, goalLabel } = req.body;
  const amount = Number(req.body.amount); // ← satu deklarasi, paksa Number

  console.log('ALLOCATE DEBUG:', { userId, goalId, amount, goalLabel, typeAmount: typeof amount });

  if (!goalId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Data tidak valid' });
  }
  try {
    // Kurangi saldo umum (throw otomatis jika tidak cukup)
    const newGeneralBalance = await updateSavingsGeneral(userId, -amount);

    // Update atau insert savings_goals (tidak ada created_at/updated_at — pakai trigger)
    const { data: existing } = await supabase
      .from('savings_goals')
      .select('allocated_amount')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .maybeSingle();

    const newAllocated = (Number(existing?.allocated_amount) || 0) + amount;

    if (existing) {
      const { error } = await supabase
        .from('savings_goals')
        .update({ allocated_amount: newAllocated })
        .eq('user_id', userId)
        .eq('goal_id', goalId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('savings_goals')
        .insert({ user_id: userId, goal_id: goalId, allocated_amount: newAllocated });
      if (error) throw error;
    }

    const { error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, amount, category: 'Transfer ke Tabungan', type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: `Alokasi ke Target: ${goalLabel || goalId}`,
        created_at: new Date().toISOString()
      });
    if (transError) throw transError;

    console.log(`✅ Alokasi ${formatRupiah(amount)} ke ${goalLabel || goalId}, sisa umum: ${formatRupiah(newGeneralBalance)}`);
    res.json({
      success: true,
      message: `Berhasil mengalokasikan ${formatRupiah(amount)} ke ${goalLabel || goalId}`,
      generalBalance: newGeneralBalance,
      goalAllocated: newAllocated
    });
  } catch (error) {
    console.error('Allocate error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/savings/withdraw-from-goal', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { goalId, goalLabel } = req.body;
  const amount = Number(req.body.amount);

  if (!goalId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Data tidak valid' });
  }
  try {
    const { data: existing, error: getError } = await supabase
      .from('savings_goals')
      .select('allocated_amount')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .maybeSingle();
    if (getError && getError.code !== 'PGRST116') throw getError;

    const currentAllocated = Number(existing?.allocated_amount) || 0;
    if (amount > currentAllocated) {
      return res.status(400).json({
        success: false,
        message: `Saldo target tidak mencukupi! Tersedia: ${formatRupiah(currentAllocated)}`
      });
    }

    const newAllocated = currentAllocated - amount;
    if (newAllocated === 0) {
      await supabase.from('savings_goals').delete().eq('user_id', userId).eq('goal_id', goalId);
    } else {
      // tidak kirim updated_at — trigger yang handle
      const { error } = await supabase
        .from('savings_goals')
        .update({ allocated_amount: newAllocated })
        .eq('user_id', userId)
        .eq('goal_id', goalId);
      if (error) throw error;
    }

    const { error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, amount, category: 'Tarik dari Tabungan', type: 'income',
        date: new Date().toISOString().split('T')[0],
        description: `WITHDRAW_GOAL:${goalId}:${goalLabel || goalId}`,
        created_at: new Date().toISOString()
      });
    if (transError) throw transError;

    res.json({
      success: true,
      message: `Berhasil menarik ${formatRupiah(amount)} dari ${goalLabel || goalId}`,
      remainingBalance: newAllocated
    });
  } catch (error) {
    console.error('Withdraw from goal error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menarik dana dari target: ' + error.message });
  }
});

// Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { type, startDate, endDate, limit, page, sort } = req.query;
    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const offset = (pageNum - 1) * limitNum;
    const ascending = sort === 'asc';

    let countQuery = supabase
      .from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    if (type && type !== 'semua') countQuery = countQuery.eq('type', type);
    if (startDate) countQuery = countQuery.gte('date', startDate);
    if (endDate) countQuery = countQuery.lte('date', endDate);
    const { count: totalCount, error: countError } = await countQuery;
    if (countError) throw countError;

    let dataQuery = supabase.from('transactions').select('*').eq('user_id', userId);
    if (type && type !== 'semua') dataQuery = dataQuery.eq('type', type);
    if (startDate) dataQuery = dataQuery.gte('date', startDate);
    if (endDate) dataQuery = dataQuery.lte('date', endDate);
    dataQuery = dataQuery.order('date', { ascending }).range(offset, offset + limitNum - 1);
    const { data: transactions, error: dataError } = await dataQuery;
    if (dataError) throw dataError;

    res.json({
      success: true, transactions: transactions || [],
      count: totalCount || 0, page: pageNum, limit: limitNum
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amount, category, type, date, description } = req.body;
  try {
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, amount, category, type,
        date: date || new Date().toISOString().split('T')[0],
        description: description || category,
        created_at: new Date().toISOString()
      })
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, transaction: newTransaction });
  } catch (err) {
    console.error('Post transaction error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id);
  try {
    const { error } = await supabase
      .from('transactions').delete().eq('id', transactionId).eq('user_id', userId);
    if (error) throw error;
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Transactions Summary
// GET 
app.get('/api/transactions/summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Ambil SEMUA transaksi tanpa limit (hanya amount, type, category)
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, category')
      .eq('user_id', userId);

    if (error) throw error;

    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.category !== 'Tarik dari Tabungan')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.category !== 'Transfer ke Tabungan')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsTransfers = transactions
      .filter(t => t.category === 'Transfer ke Tabungan')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsWithdraws = transactions
      .filter(t => t.category === 'Tarik dari Tabungan')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
      success: true,
      totalIncome,
      totalExpense,
      savingsTransfers,
      savingsWithdraws
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Transactions Summary by category
// GET
app.get('/api/transactions/summary-by-category', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Ambil semua transaksi
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, category, type')
      .eq('user_id', userId);

    if (error) throw error;

    // Hitung total per kategori untuk expense
    const categoryTotals = {};
    let totalExpenseAll = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category !== 'Transfer ke Tabungan') {
        const amount = Number(tx.amount);
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amount;
        totalExpenseAll += amount;
      }
    });

    // Urutkan dari terbesar ke terkecil
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount, percentage: totalExpenseAll > 0 ? (amount / totalExpenseAll) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Ambil 5 terbesar

    // Hitung total expense untuk kebutuhan (Needs) dan keinginan (Wants)
    // Ini perlu mapping kategori ke type (need/want)
    const NEEDS_CATEGORIES_LIST = [
      'Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas',
      'Sewa', 'Cicilan', 'Kesehatan', 'Pendidikan'
    ];
    const WANTS_CATEGORIES_LIST = [
      'Hiburan & Hobi', 'Makan di Luar', 'Belanja', 'Olahraga'
    ];

    let totalNeeds = 0;
    let totalWants = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category !== 'Transfer ke Tabungan') {
        const amount = Number(tx.amount);
        if (NEEDS_CATEGORIES_LIST.includes(tx.category)) {
          totalNeeds += amount;
        } else if (WANTS_CATEGORIES_LIST.includes(tx.category)) {
          totalWants += amount;
        }
      }
    });

    res.json({
      success: true,
      categoryTotals: sortedCategories,
      totalNeeds,
      totalWants,
      totalExpense: totalExpenseAll
    });
  } catch (err) {
    console.error('Summary by category error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/transactions/weekly
app.get('/api/transactions/weekly', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, date, type, category')
      .eq('user_id', userId);

    if (error) throw error;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const weekExp = [0, 0, 0, 0, 0, 0, 0];
    
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.category !== 'Transfer ke Tabungan') {
        const txDate = new Date(tx.date);
        if (txDate >= startOfWeek && txDate <= now) {
          weekExp[txDate.getDay()] += Number(tx.amount);
        }
      }
    });

    res.json({ success: true, weeklyExpenses: weekExp });
  } catch (err) {
    console.error('Weekly error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// AI 

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
    user_id: String(userId), month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    income: monthlyIncome, rent, loan_repayment, insurance, groceries, transport,
    eating_out, entertainment, utilities, healthcare, education, miscellaneous
  };
}

app.get('/api/ai/health', async (req, res) => {
  if (USE_MOCK_AI) {
    return res.json({ success: true, ai_api_status: 'mock_mode', message: 'Using mock AI' });
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${AI_API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    const data = await response.json();
    res.json({ success: true, ai_api_status: 'online', ai_response: data });
  } catch (error) {
    console.error('[AI Health] Error:', error.message);
    res.json({ success: true, ai_api_status: 'offline', message: error.message });
  }
});

app.post('/api/ai/predict', async (req, res) => {
  const { userId, monthlyIncome } = req.body;
  const cacheKey = `${userId}_${monthlyIncome}`;
  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) {
      console.log('[CACHE] Returning cached prediction');
      return res.json(cached.data);
    }
  }
  const { data: userTransactions } = await supabase
    .from('transactions').select('*').eq('user_id', userId);

  if (USE_MOCK_AI) {
    let label = 'Moderate';
    if (monthlyIncome >= 10000000) label = 'Financially Healthy';
    else if (monthlyIncome <= 3000000) label = 'At Risk';
    const mockResponse = {
      success: true, is_mock: true,
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
    controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${AI_API_URL}/predict-financial-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(aiRequest),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const aiData = await response.json();
    const responseData = {
      success: true,
      prediction: {
        classId: aiData.prediction?.class_id,
        label: aiData.prediction?.label,
        confidence: aiData.prediction?.confidence
      },
      probabilities: aiData.probabilities, ratios: aiData.ratios,
      summary: aiData.summary, recommendation: aiData.recommendation,
      source: aiData.recommendation_source || 'ai_api'
    };
    aiCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    res.json(responseData);
  } catch (error) {
    console.error('[REAL AI] Error:', error.message);
    const fallbackResponse = {
      success: true, is_fallback: true,
      prediction: { label: 'Moderate', confidence: 0.5 },
      recommendation: 'AI sedang sibuk, ini rekomendasi sementara: catat semua pengeluaran Anda.',
      source: 'fallback'
    };
    aiCache.set(cacheKey, { data: fallbackResponse, timestamp: Date.now() });
    res.json(fallbackResponse);
  }
});

// Reset Akun

app.delete('/api/user/reset', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await supabase.from('transactions').delete().eq('user_id', userId);
    await supabase.from('savings_goals').delete().eq('user_id', userId);
    await supabase.from('user_setups').delete().eq('user_id', userId);
    await supabase.from('users').update({ monthly_income: null }).eq('id', userId);

    const { data: existing } = await supabase
      .from('savings_general').select('id').eq('user_id', userId).maybeSingle();
    if (existing) {
      await supabase.from('savings_general').update({ balance: 0 }).eq('user_id', userId);
    } else {
      await supabase.from('savings_general').insert({ user_id: userId, balance: 0 });
    }
    console.log(`✅ Data user ${userId} berhasil direset`);
    res.json({ success: true, message: 'Data keuangan berhasil direset. Silakan setup ulang.' });
  } catch (error) {
    console.error('Reset akun error:', error);
    res.status(500).json({ success: false, message: 'Gagal mereset data' });
  }
});

// Export

module.exports.handler = serverless(app);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 SIMU Backend Running at http://localhost:${PORT}`);
    console.log(`\n📋 Endpoints:`);
    console.log(`   GET    /api/health`);
    console.log(`   GET    /api/ai/health`);
    console.log(`   POST   /api/ai/predict`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/google`);
    console.log(`   GET    /api/user/setup`);
    console.log(`   PUT    /api/user/setup`);
    console.log(`   GET    /api/user/goals`);
    console.log(`   PUT    /api/user/goals`);
    console.log(`   GET    /api/savings/balance`);
    console.log(`   POST   /api/savings/topup`);
    console.log(`   POST   /api/savings/withdraw`);
    console.log(`   POST   /api/savings/allocate-to-goal`);
    console.log(`   POST   /api/savings/withdraw-from-goal`);
    console.log(`   DELETE /api/user/reset`);
    console.log(`   GET    /api/transactions`);
    console.log(`   POST   /api/transactions`);
    console.log(`   DELETE /api/transactions/:id`);
    console.log(`\n🤖 AI Mode: ${USE_MOCK_AI ? 'MOCK' : 'REAL (Railway)'}`);
    console.log(`\n🗄️  Database: Supabase\n`);
  });
}