const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const ActivityLog = require('../models/ActivityLog');

// POST /api/auth/admin-login  { username, password, otp? }
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password, otp } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username na password vinahitajika.' });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    return res.status(500).json({
      error: 'ADMIN_PASSWORD_HASH haijawekwa kwenye .env. Tumia "npm run hash-password" kuitengeneza.',
    });
  }

  const validPassword = validUsername && (await bcrypt.compare(password, hash));

  if (!validUsername || !validPassword) {
    return res.status(401).json({ error: 'Username au password si sahihi.' });
  }

  // Optional 2FA — only enforced if ADMIN_2FA_SECRET is set in .env
  // (Table 6, High priority: "au angalau tumia bcrypt na session ya 2FA").
  if (process.env.ADMIN_2FA_SECRET) {
    if (!otp) {
      return res.status(401).json({ error: '2FA code inahitajika.', requires2FA: true });
    }
    const valid2FA = authenticator.check(otp, process.env.ADMIN_2FA_SECRET);
    if (!valid2FA) {
      return res.status(401).json({ error: '2FA code si sahihi.', requires2FA: true });
    }
  }

  const token = signToken({ id: 'admin', role: 'admin', username });
  res.json({ token, user: { username, role: 'admin' } });
});

// Called after a successful Google/GitHub OAuth login (see passport config).
// Issues our own JWT and redirects back to the frontend with it in the URL,
// since OAuth callbacks happen via full-page redirect, not fetch().
function oauthCallback(req, res) {
  const user = req.user;
  const token = signToken({ id: user._id, role: 'user', email: user.email });

  ActivityLog.create({
    icon: 'fas fa-right-to-bracket',
    text: `${user.name} logged in via ${user.provider}`,
  }).catch(() => {});

  const redirectBase = process.env.FRONTEND_URLS?.split(',')[0] || '/';
  res.redirect(`${redirectBase}?token=${token}`);
}

module.exports = { adminLogin, oauthCallback };
