const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bot: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', required: true },
    ownerName: { type: String, required: true },
    ownerNum: { type: String, required: true },
    sessionId: { type: String, required: true },
    githubUrl: { type: String, default: '' },
    platform: { type: String, required: true }, // slug from the Platform collection (heroku, panel, railway, ...)
    // Platform-specific reference so we can call Heroku/Pterodactyl again later
    externalRef: { type: String, default: '' }, // Heroku app name OR Pterodactyl server id
    status: { type: String, enum: ['pending', 'online', 'offline', 'failed', 'expired'], default: 'pending' },
    source: { type: String, enum: ['User Account', 'Deployer'], required: true },

    // ---- Subscription / auto-expiry (see cron/subscriptionCron.js) ----
    expiresAt: { type: Date, default: null }, // null = no expiry tracking (legacy/manual bots)
    reminderSentAt: { type: Date, default: null }, // prevents sending the "3 days left" email twice
    renewalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deployment', deploymentSchema);
