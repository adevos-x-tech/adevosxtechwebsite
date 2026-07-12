const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
  {
    time: { type: String, default: 'Just Now' }, // human label shown to visitors
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Update', updateSchema);
