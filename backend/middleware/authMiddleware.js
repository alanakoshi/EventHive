// backend/middleware/authMiddleware.js
const admin = require('../firebaseAdmin');

const authMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authorizationHeader.split(' ')[1]; // expecting "Bearer TOKEN"
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
