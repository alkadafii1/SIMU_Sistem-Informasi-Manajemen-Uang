const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);
router.post('/auth/google', googleLogin);

module.exports = router;