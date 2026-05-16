const { users, monthlyBudgets } = require('../storage/memory');

const calculateMonthly = (req, res, next) => {
  try {
    const { userId, monthlyIncome } = req.body;
    
    if (!userId && !monthlyIncome) {
      const error = new Error('Either userId or monthlyIncome is required');
      error.statusCode = 400;
      throw error;
    }
    
    let income = monthlyIncome;
    
    // Jika pakai userId, ambil dari data user
    if (userId && !income) {
      const user = users.find(u => u.id === userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      income = user.income;
    }
    
    // Hitung alokasi 50-30-20
    const kebutuhan = income * 0.5;
    const keinginan = income * 0.3;
    const tabungan = income * 0.2;
    
    // Hitung rekomendasi harian (asumsi 30 hari)
    const sisaHari = 30;
    const rekomendasiHarian = (kebutuhan + keinginan) / sisaHari;
    
    const budget = {
      userId: userId || null,
      income,
      alokasi: { kebutuhan, keinginan, tabungan },
      rekomendasiHarian,
      sisaHari,
      periode: new Date().toISOString().slice(0, 7), // YYYY-MM
      createdAt: new Date().toISOString()
    };
    
    monthlyBudgets.push(budget);
    
    res.json({
      success: true,
      message: 'Monthly budget calculated',
      budget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { calculateMonthly };