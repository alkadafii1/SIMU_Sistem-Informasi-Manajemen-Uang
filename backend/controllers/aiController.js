// MOCK AI - Sementara sampai AI engineer menyediakan API asli

const predictCluster = (req, res, next) => {
  try {
    const { user_id, transactions } = req.body;
    
    // Mock response berdasarkan jumlah transaksi
    const transactionCount = transactions?.length || 0;
    let cluster_id, label, description;
    
    if (transactionCount > 20) {
      cluster_id = 1;
      label = 'Aktif Transaksi';
      description = 'Anda memiliki banyak transaksi. Perhatikan pengeluaran kecil yang tidak terasa.';
    } else if (transactionCount > 10) {
      cluster_id = 2;
      label = 'Pengeluaran Stabil';
      description = 'Pola transaksi Anda cukup teratur. Pertahankan kebiasaan mencatat.';
    } else {
      cluster_id = 3;
      label = 'Pencatat Baru';
      description = 'Mulai konsisten mencatat untuk mendapatkan insight yang lebih akurat.';
    }
    
    res.json({
      success: true,
      cluster_id,
      label,
      description
    });
  } catch (error) {
    next(error);
  }
};

const predictHealth = (req, res, next) => {
  try {
    const { monthly_income, monthly_expense, savings, debt_ratio } = req.body;
    
    const income = monthly_income || 0;
    const expense = monthly_expense || 0;
    const saving = savings || (income - expense);
    const debt = debt_ratio || 0;
    
    let score = 50; // default
    let status = 'Cukup';
    let advice = '';
    
    if (income > 0) {
      const savingRate = saving / income;
      score = Math.min(100, Math.max(0, Math.round(savingRate * 100 + (1 - debt) * 20)));
      
      if (score >= 80) {
        status = 'Sehat';
        advice = 'Kondisi keuangan Anda sangat baik. Pertahankan dan tingkatkan investasi.';
      } else if (score >= 50) {
        status = 'Cukup';
        advice = 'Masih ada ruang untuk mengurangi pengeluaran tidak perlu.';
      } else {
        status = 'Perhatian';
        advice = 'Segera evaluasi pengeluaran. Fokus pada kebutuhan pokok dulu.';
      }
    }
    
    res.json({
      success: true,
      score,
      status,
      advice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { predictCluster, predictHealth };