const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deployment', 'deployment_renewal', 'deployer_subscription'], required: true },
    deployment: { type: mongoose.Schema.Types.ObjectId, ref: 'Deployment', default: null },
    method: { type: String, enum: ['paystack', 'manual', 'coins'], required: true },
    amount: { type: Number, default: 0 }, // 0 when method === 'coins'
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    reference: { type: String, default: '' }, // Paystack reference, or receipt note for manual
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
