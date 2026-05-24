const { users, transactions } = require('../storage/memory');

// Helper functions
const getTotalIncomeByUser = (userId) => {
  return transactions
    .filter(t => t.userId === userId && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

const getTotalExpenseByUser = (userId) => {
  return transactions
    .filter(t => t.userId === userId && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

// Tambah transaksi (dengan validasi saldo yang memperhitungkan pemasukan)
const addTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category || !date) {
      const error = new Error('Missing required fields: type, amount, category, date');
      error.statusCode = 400;
      throw error;
    }

    if (type !== 'income' && type !== 'expense') {
      const error = new Error('Type must be "income" or "expense"');
      error.statusCode = 400;
      throw error;
    }

    // Validasi saldo untuk pengeluaran
    if (type === 'expense') {
      const user = users.find(u => u.id === userId);
      if (!user || !user.setup) {
        const error = new Error('User belum melakukan setup keuangan');
        error.statusCode = 400;
        throw error;
      }

      const totalIncome = getTotalIncomeByUser(userId);
      const totalExpense = getTotalExpenseByUser(userId);
      const incomeFromSetup = user.setup.income;

      const remaining = (incomeFromSetup + totalIncome) - (totalExpense + Number(amount));
      if (remaining < 0) {
        const currentRemaining = (incomeFromSetup + totalIncome) - totalExpense;
        const error = new Error(`Saldo tidak cukup. Pengeluaran melebihi pendapatan. Sisa budget: ${currentRemaining}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const newTransaction = {
      id: transactions.length + 1,
      userId,
      type,
      amount: Number(amount),
      category,
      date,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);

    res.status(201).json({
      success: true,
      message: 'Transaction added',
      transaction: newTransaction
    });
  } catch (error) {
    next(error);
  }
};

// Get transactions (hanya milik user)
const getTransactions = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, type, startDate, endDate } = req.query;
    let result = transactions.filter(t => t.userId === userId);

    if (type) {
      result = result.filter(t => t.type === type);
    }

    if (startDate) {
      result = result.filter(t => t.date >= startDate);
    }

    if (endDate) {
      result = result.filter(t => t.date <= endDate);
    }

    if (limit) {
      result = result.slice(0, parseInt(limit));
    }

    // Urutkan dari yang terbaru
    result.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    res.json({
      success: true,
      count: result.length,
      transactions: result
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction (belum ada validasi ulang saldo, bisa ditambahkan nanti)
const updateTransaction = (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);

    if (index === -1) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const { type, amount, category, date, description } = req.body;

    if (type) transactions[index].type = type;
    if (amount) transactions[index].amount = Number(amount);
    if (category) transactions[index].category = category;
    if (date) transactions[index].date = date;
    if (description) transactions[index].description = description;

    transactions[index].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Transaction updated',
      transaction: transactions[index]
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
const deleteTransaction = (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);

    if (index === -1) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const deleted = transactions.splice(index, 1);

    res.json({
      success: true,
      message: 'Transaction deleted',
      transaction: deleted[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};