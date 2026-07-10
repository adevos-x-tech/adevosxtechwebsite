const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Setting = require('../models/Setting');
const Deployment = require('../models/Deployment');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

const PAYSTACK_BASE = 'https://api.paystack.co';

function assertPaystackConfigured() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    const err = new Error('PAYSTACK_SECRET_KEY haijawekwa kwenye .env.');
    err.statusCode = 500;
    throw err;
  }
}

// Works out how much a transaction should cost, including the
// "Discounted Pre-Renewal" incentive (Table 1) when someone renews a
// deployment before it actually expires.
async function computeAmount(type, deploymentId) {
  const pricing = (await Setting.findOne({ key: 'pricing' }))?.value || {};
  const deployer = (await Setting.findOne({ key: 'deployer' }))?.value || {};
  const subscription = (await Setting.findOne({ key: 'subscription' }))?.value || {};

  if (type === 'deployer_subscription') return deployer.price ?? 10;
  if (type === 'deployment') return pricing.deployPrice ?? 5;

  if (type === 'deployment_renewal') {
    const base = pricing.deployPrice ?? 5;
    if (!deploymentId) return base;
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment?.expiresAt) return base;

    const daysLeft = (deployment.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    const withinWindow = daysLeft > 0 && daysLeft <= (subscription.discountValidDaysBefore ?? 3);
    if (withinWindow) {
      const discountPct = subscription.renewalDiscountPercent ?? 0;
      return Number((base * (1 - discountPct / 100)).toFixed(2));
    }
    return base;
  }

  return 0;
}

// POST /api/paystack/initialize  { userId, type, deploymentId? }
const initializePaystack = asyncHandler(async (req, res) => {
  assertPaystackConfigured();
  const { userId, type, deploymentId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });

  const amountUsd = await computeAmount(type, deploymentId);

  const transaction = await Transaction.create({
    user: user._id,
    type,
    deployment: deploymentId || null,
    method: 'paystack',
    amount: amountUsd,
    status: 'pending',
  });

  const res_ = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      amount: Math.round(amountUsd * 100), // Paystack expects the smallest currency unit
      reference: String(transaction._id),
      metadata: { userId: String(user._id), type, deploymentId: deploymentId || null },
    }),
  });
  const data = await res_.json();
  if (!data.status) throw new Error(data.message || 'Paystack initialize imeshindwa.');

  transaction.reference = data.data.reference;
  await transaction.save();

  res.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference, amount: amountUsd });
});

// POST /api/paystack/webhook — Paystack calls this after payment
const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Webhook signature si sahihi.' });
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const transaction = await Transaction.findOne({ reference });
    if (transaction && transaction.status !== 'confirmed') {
      transaction.status = 'confirmed';
      await transaction.save();
      await applyConfirmedPayment(transaction);
    }
  }

  res.sendStatus(200);
});

// Shared logic: once a payment (Paystack OR manually-verified) is confirmed,
// actually grant whatever the user paid for.
async function applyConfirmedPayment(transaction) {
  const user = await User.findById(transaction.user);
  if (!user) return;

  if (transaction.type === 'deployer_subscription') {
    const deployer = (await Setting.findOne({ key: 'deployer' }))?.value;
    const days = deployer?.days || 30;
    user.plan = 'Deployer';
    user.isDeployerPaid = true;
    user.deployerExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await user.save();
    await ActivityLog.create({
      icon: 'fas fa-user-shield',
      text: `${user.name} upgraded to Deployer Account`,
    });
  } else if (transaction.type === 'deployment') {
    // Deployment itself is created via POST /api/deploy once the frontend
    // sees this transaction is confirmed — payment just unlocks the slot.
    await ActivityLog.create({
      icon: 'fas fa-credit-card',
      text: `Payment received — $${transaction.amount} deployment (${user.name})`,
    });
  } else if (transaction.type === 'deployment_renewal') {
    // Lazy-require to avoid a circular require between the two controllers.
    const { renewDeployment } = require('./deploymentsController');
    if (transaction.deployment) await renewDeployment(transaction.deployment);
  }
}

// ---------- MANUAL PAYMENTS ----------

// POST /api/payments/manual  { userId, type, deploymentId?, note }
const submitManualPayment = asyncHandler(async (req, res) => {
  const { userId, type, deploymentId, note } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });

  const amountUsd = await computeAmount(type, deploymentId);

  const transaction = await Transaction.create({
    user: user._id,
    type,
    deployment: deploymentId || null,
    method: 'manual',
    amount: amountUsd,
    status: 'pending',
    reference: note || '',
  });

  res.status(201).json(transaction);
});

// GET /api/admin/payments  (admin sees all pending + past manual payments)
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(transactions);
});

// POST /api/admin/payments/:id/verify  (admin clicks "Mark as Paid")
const verifyManualPayment = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Malipo hayapo.' });
  if (transaction.status === 'confirmed') {
    return res.json({ success: true, message: 'Tayari imethibitishwa.' });
  }
  transaction.status = 'confirmed';
  await transaction.save();
  await applyConfirmedPayment(transaction);
  res.json({ success: true, transaction });
});

module.exports = {
  initializePaystack,
  paystackWebhook,
  submitManualPayment,
  getAllTransactions,
  verifyManualPayment,
  computeAmount,
};
