const express = require('express');
const cors = require('cors');

const onboardingRoutes = require('./routes/onboarding');
const transactionsRoutes = require('./routes/transactions');
const monthlyRoutes = require('./routes/monthly');
const rolloverRoutes = require('./routes/rollover');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', onboardingRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', monthlyRoutes);
app.use('/api', rolloverRoutes);
app.use('/api', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SIMU Backend Running' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend SIMU running at http://localhost:${PORT}`);
});