const express = require('express');
const router = express.Router();
const { calculateMonthly } = require('../controllers/monthlyController');

router.post('/monthly', calculateMonthly);

module.exports = router;