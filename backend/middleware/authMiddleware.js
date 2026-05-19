const { verifyToken } = require('../utils/jwt');
const { users } = require('../storage/memory');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Token tidak disediakan' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: true, message: 'Token tidak valid' });
  }

  const user = users.find(u => u.id === decoded.userId);
  if (!user) {
    return res.status(401).json({ error: true, message: 'User tidak ditemukan' });
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;