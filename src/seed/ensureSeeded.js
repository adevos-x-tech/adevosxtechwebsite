const { DEFAULTS } = require('./defaults');

const Slide = require('../models/Slide');
const Service = require('../models/Service');
const TouchCard = require('../models/TouchCard');
const Update = require('../models/Update');
const Feedback = require('../models/Feedback');
const Bot = require('../models/Bot');
const Tutorial = require('../models/Tutorial');
const Platform = require('../models/Platform');
const PaymentMethod = require('../models/PaymentMethod');
const Setting = require('../models/Setting');

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

// Called once from server.js right after MongoDB connects. Only fills in
// collections/settings that are completely empty — never overwrites real
// data. This means hosts without shell access (e.g. Render free tier) still
// get working demo content on first boot, with zero manual steps.
async function ensureSeeded() {
  let seededAnything = false;

  for (const [key, Model] of Object.entries(LIST_MODELS)) {
    const count = await Model.countDocuments();
    if (count === 0) {
      await Model.insertMany(DEFAULTS.lists[key]);
      console.log(`🌱 Auto-seeded "${key}" (${DEFAULTS.lists[key].length} items) — collection was empty.`);
      seededAnything = true;
    }
  }

  for (const [key, value] of Object.entries(DEFAULTS.settings)) {
    const existing = await Setting.findOne({ key });
    if (!existing) {
      await Setting.create({ key, value });
      console.log(`🌱 Auto-seeded setting "${key}" — it was missing.`);
      seededAnything = true;
    }
  }

  if (!seededAnything) {
    console.log('✅ Content already present — auto-seed skipped.');
  }
}

module.exports = { ensureSeeded };

