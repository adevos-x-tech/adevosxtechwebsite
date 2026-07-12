const mongoose = require('mongoose');

// Metadata only. The ACTUAL deploy logic for a platform still lives in
// src/services/<slug>Service.js and is wired into src/utils/dynamicDeploy.js —
// this collection just controls whether it's active, its name/description,
// and where its button appears (position). Adding a brand new platform
// (e.g. Railway) needs one small code change (see dynamicDeploy.js), but
// toggling existing platforms on/off, renaming them, or reordering them
// never touches code.
const platformSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // heroku | panel | railway
    name: { type: String, required: true }, // "Heroku", "Pterodactyl Panel"
    description: { type: String, default: '' },
    envKeyHint: { type: String, default: '' }, // e.g. "HEROKU_API_KEY" — shown to admin, never the value itself
    icon: { type: String, default: 'fas fa-server' },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Platform', platformSchema);
