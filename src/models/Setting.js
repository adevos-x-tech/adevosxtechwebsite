const mongoose = require('mongoose');

// A single flexible collection for every "settings bucket" the admin panel
// controls that isn't a list of individually add/edit/delete-able items:
//   key = "social"        -> array of {key, icon, url}
//   key = "links"         -> { freeBot, devContact, waCommunity, waChannel, tgChannel, pairFallback, assistantGreet, assistantReply }
//   key = "music"         -> { autoplay, volume, tracks: [{name, url}] }
//   key = "notifications" -> { enabled, intervalSeconds, durationSeconds, stopAfterMinutes }
//   key = "pricing"       -> { deployPrice, coinsPerReferral, coinsPerDeploy }
//   key = "deployer"      -> { price, days, benefits }
//   key = "payments"      -> array of {label, number}
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
