import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret', (err, user) => {
    if (err) {
      return res.status(401).json({ detail: 'Invalid or expired token' });
    }
    req.user = user; // Contains payload ({ sub: email, id: ... })
    next();
  });
};