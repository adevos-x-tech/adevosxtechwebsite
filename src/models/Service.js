const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'fas fa-star' },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
