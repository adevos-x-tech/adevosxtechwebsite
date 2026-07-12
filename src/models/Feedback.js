const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
