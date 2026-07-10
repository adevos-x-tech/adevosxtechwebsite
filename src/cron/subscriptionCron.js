const cron = require('node-cron');
const Deployment = require('../models/Deployment');
const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const { sendEmail } = require('../utils/emailService');
const { stopHerokuApp } = require('../services/herokuService');
const { suspendPanelServer } = require('../services/pterodactylService');

async function stopByPlatform(deployment) {
  try {
    if (deployment.platform === 'heroku') {
      await stopHerokuApp(deployment.externalRef);
    } else if (deployment.platform === 'panel') {
      // NOTE: Pterodactyl's suspend endpoint expects the server's internal
      // numeric ID, not the short "identifier" saved as externalRef. Adjust
      // this once you confirm which one your panel setup exposes/needs.
      await suspendPanelServer(deployment.externalRef);
    }
  } catch (err) {
    console.error(`⚠️  Imeshindwa kuzima ${deployment.platform} bot (${deployment._id}):`, err.message);
  }
}

// Runs once a day: anything past its expiresAt gets stopped + marked 'expired'.
async function runExpiryCheck() {
  const expired = await Deployment.find({
    status: { $in: ['online', 'pending'] },
    expiresAt: { $ne: null, $lte: new Date() },
  }).populate('bot', 'name').populate('user', 'name email');

  for (const deployment of expired) {
    await stopByPlatform(deployment);
    deployment.status = 'expired';
    await deployment.save();
    await ActivityLog.create({
      icon: 'fas fa-power-off',
      text: `${deployment.bot?.name} expired and was stopped (owner: ${deployment.user?.name})`,
    });
  }

  if (expired.length) console.log(`⏰ Expiry check: stopped ${expired.length} deployment(s).`);
}

// Runs once a day: sends a reminder email N days before expiry (once only,
// tracked via reminderSentAt so nobody gets spammed).
async function runReminderCheck() {
  const subscription = (await Setting.findOne({ key: 'subscription' }))?.value || {};
  const daysBefore = subscription.reminderDaysBefore ?? 3;

  const windowStart = new Date();
  const windowEnd = new Date(Date.now() + daysBefore * 24 * 60 * 60 * 1000);

  const dueSoon = await Deployment.find({
    status: 'online',
    expiresAt: { $gte: windowStart, $lte: windowEnd },
    reminderSentAt: null,
  }).populate('bot', 'name').populate('user', 'name email');

  for (const deployment of dueSoon) {
    if (!deployment.user?.email) continue;
    try {
      await sendEmail({
        to: deployment.user.email,
        subject: `${deployment.bot?.name} inaisha muda wake hivi karibuni`,
        html: `<p>Habari ${deployment.user.name},</p>
               <p>Bot yako <b>${deployment.bot?.name}</b> itaisha muda (expire) tarehe ${deployment.expiresAt.toDateString()}.</p>
               <p>Renew sasa kabla haijasimama ili uendelee kupata huduma bila kukatika.</p>`,
      });
      deployment.reminderSentAt = new Date();
      await deployment.save();
    } catch (err) {
      console.error(`⚠️  Imeshindwa kutuma reminder email (${deployment._id}):`, err.message);
    }
  }

  if (dueSoon.length) console.log(`✉️  Reminder check: emailed ${dueSoon.length} user(s).`);
}

// Call this once from server.js to start both schedules.
function startCronJobs() {
  // Every day at 02:00 server time — stop expired deployments.
  cron.schedule('0 2 * * *', () => {
    runExpiryCheck().catch((err) => console.error('Expiry cron failed:', err));
  });

  // Every day at 09:00 server time — send renewal reminders.
  cron.schedule('0 9 * * *', () => {
    runReminderCheck().catch((err) => console.error('Reminder cron failed:', err));
  });

  console.log('🕒 Cron jobs zimeanzishwa (expiry: 02:00, reminders: 09:00 kila siku).');
}

module.exports = { startCronJobs, runExpiryCheck, runReminderCheck };
