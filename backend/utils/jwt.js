const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'simu-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };