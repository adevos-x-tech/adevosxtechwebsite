const asyncHandler = require('../utils/asyncHandler');
const { DEFAULTS } = require('../seed/defaults');

const Slide = require('../models/Slide');
const Service = require('../models/Service');
const TouchCard = require('../models/TouchCard');
const Update = require('../models/Update');
const Feedback = require('../models/Feedback');
const Bot = require('../models/Bot');
const Tutorial = require('../models/Tutorial');
const Setting = require('../models/Setting');
const Platform = require('../models/Platform');
const PaymentMethod = require('../models/PaymentMethod');
const ActivityLog = require('../models/ActivityLog');

const LIST_MODELS = {
  slides: Slide,
  services: Service,
  touchcards: TouchCard,
  updates: Update,
  feedback: Feedback,
  bots: Bot,
  tutorials: Tutorial,
  platforms: Platform,
  paymentMethods: PaymentMethod,
};

// POST /api/admin/reset
// Restores every content collection and settings bucket to the original
// defaults. Does NOT touch Users, Deployments or Transactions — those are
// real records, not demo content, so they're deliberately left alone.
const resetAllContent = asyncHandler(async (req, res) => {
  for (const [key, Model] of Object.entries(LIST_MODELS)) {
    await Model.deleteMany({});
    await Model.insertMany(DEFAULTS.lists[key]);
  }

  for (const [key, value] of Object.entries(DEFAULTS.settings)) {
    await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
  }

  await ActivityLog.create({ icon: 'fas fa-rotate-left', text: 'Admin reset all content to defaults' });

  res.json({ success: true, message: 'Data zote za content zimerudishwa kwenye default.' });
});

module.exports = { resetAllContent };
