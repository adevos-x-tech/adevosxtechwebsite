const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'fas fa-bolt' },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
