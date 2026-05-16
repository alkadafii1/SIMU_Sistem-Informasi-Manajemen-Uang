const express = require('express');
const router = express.Router();
const { saveOnboarding } = require('../controllers/onboardingController');

router.post('/onboarding', saveOnboarding);

module.exports = router;