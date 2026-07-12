const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    provider: { type: String, enum: ['google', 'github', 'manual'], default: 'manual' },
    googleId: { type: String },
    githubId: { type: String },
    passwordHash: { type: String }, // only set if provider === 'manual'

    profilePicUrl: { type: String, default: '' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },

    plan: { type: String, enum: ['User', 'Deployer'], default: 'User' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },

    coins: { type: Number, default: 0 },

    isDeployerPaid: { type: Boolean, default: false },
    deployerExpiry: { type: Date, default: null },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
