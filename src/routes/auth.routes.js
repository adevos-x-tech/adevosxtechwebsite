const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { adminLogin, oauthCallback } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiters');
const { handleValidation } = require('../middleware/validate');
const { adminLoginRules } = require('../validators/rules');

// ---------- Admin (Sector 24) ----------
router.post('/admin-login', loginLimiter, adminLoginRules, handleValidation, adminLogin);

// ---------- Google OAuth (Sector 1) ----------
// Only mounted if credentials exist in .env — otherwise returns a clear message
// instead of crashing the whole server.
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: 'Google OAuth haijawekwa bado kwenye .env (GOOGLE_CLIENT_ID/SECRET).' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
router.get(
  '/google/callback',
  (req, res, next) => passport.authenticate('google', { session: false, failureRedirect: '/' })(req, res, next),
  oauthCallback
);

// ---------- GitHub OAuth (Sector 1) ----------
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(501).json({ error: 'GitHub OAuth haijawekwa bado kwenye .env (GITHUB_CLIENT_ID/SECRET).' });
  }
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});
router.get(
  '/github/callback',
  (req, res, next) => passport.authenticate('github', { session: false, failureRedirect: '/' })(req, res, next),
  oauthCallback
);

module.exports = router;
