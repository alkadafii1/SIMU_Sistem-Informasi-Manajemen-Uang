const { transactions } = require('../storage/memory');

const addTransaction = (req, res, next) => {
  try {
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
    
    const newTransaction = {
      id: transactions.length + 1,
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

const getTransactions = (req, res, next) => {
  try {
    const { limit, type, startDate, endDate } = req.query;
    let result = [...transactions];
    
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
    
    res.json({
      success: true,
      count: result.length,
      transactions: result
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const index = transactions.findIndex(t => t.id === id);
    
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

const deleteTransaction = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const index = transactions.findIndex(t => t.id === id);
    
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