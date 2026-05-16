const express = require('express');
const router = express.Router();
const { predictCluster, predictHealth } = require('../controllers/aiController');

router.post('/ai/cluster', predictCluster);
router.post('/ai/financial-health', predictHealth);

module.exports = router;