const express = require('express');
const router = express.Router();
const { rolloverMonth } = require('../controllers/rolloverController');

router.post('/rollover', rolloverMonth);

module.exports = router;