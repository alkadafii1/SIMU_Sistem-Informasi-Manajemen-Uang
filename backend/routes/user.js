const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { saveSetup, getSetup } = require('../controllers/userController');

router.put('/user/setup', authMiddleware, saveSetup);
router.get('/user/setup', authMiddleware, getSetup);

module.exports = router;