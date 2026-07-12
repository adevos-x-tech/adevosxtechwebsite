require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { DEFAULTS } = require('./defaults');

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

async function run() {
  const shouldReset = process.argv.includes('--reset');
  await connectDB();

  for (const [key, Model] of Object.entries(LIST_MODELS)) {
    const count = await Model.countDocuments();
    if (shouldReset) await Model.deleteMany({});
    if (shouldReset || count === 0) {
      await Model.insertMany(DEFAULTS.lists[key]);
      console.log(`✅ Seeded ${key} (${DEFAULTS.lists[key].length} items)`);
    } else {
      console.log(`↷ Skipped ${key} — already has ${count} item(s). Use --reset to overwrite.`);
    }
  }

  for (const [key, value] of Object.entries(DEFAULTS.settings)) {
    const existing = await Setting.findOne({ key });
    if (shouldReset || !existing) {
      await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
      console.log(`✅ Seeded setting "${key}"`);
    } else {
      console.log(`↷ Skipped setting "${key}" — already exists. Use --reset to overwrite.`);
    }
  }

  console.log('\n🎉 Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
