const { users } = require('../storage/memory');

const saveOnboarding = (req, res, next) => {
  try {
    const { income, goal } = req.body;
    
    if (!income) {
      const error = new Error('Income is required');
      error.statusCode = 400;
      throw error;
    }
    
    const newUser = {
      id: users.length + 1,
      income: Number(income),
      goal: goal || null,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User saved successfully',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveOnboarding };