const mongoose = require('mongoose');

const touchCardSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // deploy | deployeracc | manage | tutorials | feedback | support | developer | updates
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    img: { type: String, required: true },
    btn: { type: String, default: '' },
    actionType: { type: String, enum: ['internal', 'external'], default: 'internal' },
    action: { type: String, default: '' }, // deployModal | deployerModal | manageModal | tutorialsModal | feedbackForm | supportDropdown | updatesCard
    url: { type: String, default: '' },
    // Controls how the card's image/text are arranged on public.html —
    // the frontend maps this string straight to a CSS class.
    layout: {
      type: String,
      enum: ['image-top', 'image-left', 'image-right', 'image-background'],
      default: 'image-top',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TouchCard', touchCardSchema);
