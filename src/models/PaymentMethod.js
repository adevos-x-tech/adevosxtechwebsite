const mongoose = require('mongoose');

// type: "online"  -> a real gateway (Paystack, Flutterwave...) — the charging
//                     logic still needs a service file + route wiring once,
//                     but listing/activating/deactivating it needs no code.
// type: "manual"  -> just shows `instructions` (e.g. an M-Pesa number) to the
//                     user; admin can add/edit/delete these freely, zero code.
// type: "coins"   -> pays using the user's AV Coins balance.
const paymentMethodSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true }, // "Paystack", "M-Pesa (Ahmed)", "AV Coins"
    type: { type: String, enum: ['online', 'manual', 'coins'], required: true },
    instructions: { type: String, default: '' }, // number + note, only relevant for type:"manual"
    icon: { type: String, default: 'fas fa-money-bill-wave' },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
