const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionsController');

router.post('/transactions', authMiddleware, addTransaction);
router.get('/transactions', authMiddleware, getTransactions);
router.put('/transactions/:id', authMiddleware, updateTransaction);
router.delete('/transactions/:id', authMiddleware, deleteTransaction);

module.exports = router;