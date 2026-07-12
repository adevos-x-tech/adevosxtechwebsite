const express = require('express');
const router = express.Router();

const Slide = require('../models/Slide');
const Service = require('../models/Service');
const TouchCard = require('../models/TouchCard');
const Update = require('../models/Update');
const Feedback = require('../models/Feedback');
const Bot = require('../models/Bot');
const Tutorial = require('../models/Tutorial');
const asyncHandler = require('../utils/asyncHandler');
const { handleValidation } = require('../middleware/validate');
const { deployRules, registerRules } = require('../validators/rules');
const { deployLimiter } = require('../middleware/rateLimiters');

const { getSetting, getAllSettings } = require('../controllers/settingsController');
const { getReferralLink, registerWithReferral } = require('../controllers/referralController');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const {
  createDeployment,
  createDeploymentWithCoins,
  getUserDeployments,
} = require('../controllers/deploymentsController');
const { initializePaystack, paystackWebhook, submitManualPayment } = require('../controllers/paymentsController');
const { getActivePlatforms } = require('../controllers/platformsController');
const { getActivePaymentMethods } = require('../controllers/paymentMethodsController');

// ---------- Read-only content (Sectors 3–9) ----------
router.get('/slides', asyncHandler(async (req, res) => res.json(await Slide.find().sort({ order: 1 }))));
router.get('/services', asyncHandler(async (req, res) => res.json(await Service.find().sort({ order: 1 }))));
router.get('/touchcards', asyncHandler(async (req, res) => res.json(await TouchCard.find().sort({ order: 1 }))));
router.get('/updates', asyncHandler(async (req, res) => res.json(await Update.find().sort({ createdAt: -1 }).limit(20))));
router.get('/testimonials', asyncHandler(async (req, res) => res.json(await Feedback.find())));
router.get('/tutorials', asyncHandler(async (req, res) => res.json(await Tutorial.find())));

router.get('/bots', asyncHandler(async (req, res) => res.json(await Bot.find())));
router.get('/bots/featured', asyncHandler(async (req, res) => res.json(await Bot.findOne({ isFeatured: true }))));

// ---------- Dynamic Platforms & Payment Methods (Tables 3 & 4) ----------
router.get('/platforms', getActivePlatforms);
router.get('/payment-methods', getActivePaymentMethods);

// ---------- Settings buckets (Sectors 6, 17, 18, 19) ----------
router.get('/settings', getAllSettings);
router.get('/settings/:key', getSetting);
router.get('/notif-settings', (req, res, next) => {
  req.params.key = 'notifications';
  getSetting(req, res, next);
});

// ---------- Auth / Referral (Sectors 1, 11) ----------
router.post('/auth/register', registerRules, handleValidation, registerWithReferral);
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });
  res.json(user);
}));
router.get('/user/:id/referral-link', getReferralLink);

// ---------- User's own deployments — replaces localStorage (Table 6) ----------
router.get('/user/:userId/deployments', getUserDeployments);

// ---------- Deployment (Sectors 12, 13) ----------
router.post('/deploy', deployLimiter, deployRules, handleValidation, createDeployment);
router.post('/deploy/with-coins', deployLimiter, deployRules, handleValidation, createDeploymentWithCoins);

// ---------- Payments (Sectors 14, 15) ----------
router.post('/paystack/initialize', initializePaystack);
router.post('/paystack/webhook', paystackWebhook);
router.post('/payments/manual', submitManualPayment);

module.exports = router;
