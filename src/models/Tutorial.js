const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema(
  {
    tutorialId: { type: String, required: true, unique: true }, // whatsapp | telegram | deployer | freebot | ...
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    icon: { type: String, default: 'fas fa-play-circle' },
    video: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tutorial', tutorialSchema);
