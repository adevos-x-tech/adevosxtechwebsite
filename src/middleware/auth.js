const { verifyToken } = require('../utils/jwt');

// Protects any route that only the Admin dashboard (or a logged-in user)
// should be able to reach. Expects: Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Hujaingia. Tuma Authorization: Bearer <token>.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token si sahihi au imeisha muda wake.' });
  }
}

// Stricter variant: only lets the request through if the token's role is 'admin'
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Huna ruhusa ya sehemu hii — Admin pekee.' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
