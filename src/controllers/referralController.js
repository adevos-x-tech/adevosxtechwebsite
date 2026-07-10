const User = require('../models/User');
const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { makeReferralCode } = require('../utils/referral');
const { signToken } = require('../utils/jwt');

// GET /api/user/:id/referral-link
const getReferralLink = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });

  if (!user.referralCode) {
    user.referralCode = makeReferralCode(user.name);
    await user.save();
  }

  const base = process.env.FRONTEND_URLS?.split(',')[0] || 'https://adevosx.site';
  res.json({ link: `${base}/join?ref=${user.referralCode}`, code: user.referralCode });
});

// POST /api/auth/register  { name, email, referralCode? }
// Called by public.html's manual signup / first-OAuth-login flow.
// Credits whoever referred this new user with coins.
const registerWithReferral = asyncHandler(async (req, res) => {
  const { name, email, referralCode } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Jina na email vinahitajika.' });

  const existing = await User.findOne({ email });
  if (existing) {
    const token = signToken({ id: existing._id, role: 'user', email: existing.email });
    return res.json({ user: existing, token });
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referredBy = referrer._id;
      const pricing = (await Setting.findOne({ key: 'pricing' }))?.value;
      const bonus = pricing?.coinsPerReferral ?? 2;
      referrer.coins += bonus;
      await referrer.save();
      await ActivityLog.create({
        icon: 'fas fa-coins',
        text: `${referrer.name} earned ${bonus} AV Coins from a referral`,
      });
    }
  }

  const user = await User.create({
    name,
    email,
    provider: 'manual',
    referredBy,
    referralCode: makeReferralCode(name),
  });

  await ActivityLog.create({ icon: 'fas fa-user-plus', text: `New user registered: ${user.name}` });
  const token = signToken({ id: user._id, role: 'user', email: user.email });
  res.status(201).json({ user, token });
});

module.exports = { getReferralLink, registerWithReferral };
