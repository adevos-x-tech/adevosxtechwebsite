const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail } = require('../utils/emailService');
const { makeReferralCode } = require('../utils/referral');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, plan, status, coins } = req.body;
  const user = await User.create({
    name,
    email,
    plan: plan || 'User',
    status: status || 'active',
    coins: coins || 0,
    provider: 'manual',
    referralCode: makeReferralCode(name),
  });
  await ActivityLog.create({ icon: 'fas fa-user-plus', text: `New user added: ${user.name}` });
  res.status(201).json(user);
});

// PUT /api/admin/users/:id  — edit plan/status/coins/name/email (admin "grant access" action)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return res.status(404).json({ error: 'Mtumiaji hayupo.' });
  await ActivityLog.create({
    icon: 'fas fa-user-pen',
    text: `${user.name}'s account was updated by admin`,
  });
  res.json(user);
});

// POST /api/admin/users/:id/gift-coins  { amount }
const giftCoins = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Weka idadi sahihi ya coins (zaidi ya 0).' });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $inc: { coins: amount } },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: 'Mtumiaji hayupo.' });
  await ActivityLog.create({
    icon: 'fas fa-coins',
    text: `Admin gifted ${amount} AV Coins to ${user.name}`,
  });
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Mtumiaji hayupo.' });
  res.json({ success: true, id: req.params.id });
});

// POST /api/admin/users/:id/message  { subject, message }
const messageUser = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject na message vinahitajika.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Mtumiaji hayupo.' });

  await sendEmail({ to: user.email, subject, html: `<p>${message}</p>` });
  await ActivityLog.create({
    icon: 'fas fa-paper-plane',
    text: `Admin sent an email to ${user.name} (${user.email}): "${subject}"`,
  });
  res.json({ success: true });
});

module.exports = { getAllUsers, createUser, updateUser, giftCoins, deleteUser, messageUser };
