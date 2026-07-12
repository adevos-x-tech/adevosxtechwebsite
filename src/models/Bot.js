const mongoose = require('mongoose');

const botSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, default: '' },
    img: { type: String, required: true },
    github: { type: String, default: '' },
    author: { type: String, default: 'Adevos-X Team' },
    addedDate: { type: String, default: '' }, // display label e.g. "June 28, 2026"
    // A User Account can only ever deploy the ONE bot flagged isFeatured=true.
    // Deployer accounts can pick from every bot in this collection.
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bot', botSchema);
