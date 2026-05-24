const { users } = require('../storage/memory');

// Menyimpan setup keuangan user (income, alokasi persen, goals)
const saveSetup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { income, allocation, goals } = req.body;

    if (!income || !allocation) {
      const error = new Error('Income dan allocation wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Simpan data setup ke user
    users[userIndex].setup = {
      income: Number(income),
      allocation: {
        kebutuhan: allocation.kebutuhan || 50,
        keinginan: allocation.keinginan || 30,
        tabungan: allocation.tabungan || 20
      },
      goals: goals || [],
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Setup keuangan berhasil disimpan',
      setup: users[userIndex].setup
    });
  } catch (error) {
    next(error);
  }
};

// Mendapatkan data setup user (opsional)
const getSetup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = users.find(u => u.id === userId);
    if (!user || !user.setup) {
      return res.status(404).json({ success: false, message: 'Setup belum diisi' });
    }
    res.json({ success: true, setup: user.setup });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveSetup, getSetup };