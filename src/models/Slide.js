const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    cta: { type: String, default: '' },
    actionType: { type: String, enum: ['internal', 'external'], default: 'internal' },
    action: { type: String, default: '' }, // support | tutorials | coins | deployer
    url: { type: String, default: '' },
    // CSS background-position value, e.g. "center center", "top left"
    imagePosition: { type: String, default: 'center center' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slide', slideSchema);
