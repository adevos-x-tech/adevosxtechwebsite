const Deployment = require('../models/Deployment');
const Bot = require('../models/Bot');
const User = require('../models/User');
const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { runDeploy } = require('../utils/dynamicDeploy');

const getAllDeployments = asyncHandler(async (req, res) => {
  const deployments = await Deployment.find()
    .populate('user', 'name email plan')
    .populate('bot', 'name img')
    .sort({ createdAt: -1 });
  res.json(deployments);
});

// GET /api/public/user/:id/deployments — frontend reads this INSTEAD of
// localStorage's userDeployedBot/deployedBots, so a bot survives the user
// switching browsers or devices (Table 6, "Low" item — now implemented).
const getUserDeployments = asyncHandler(async (req, res) => {
  const deployments = await Deployment.find({ user: req.params.userId })
    .populate('bot', 'name img github')
    .sort({ createdAt: -1 });
  res.json(deployments);
});

// Core deployment logic shared by the normal paid flow and the coins flow.
async function performDeployment({ user, bot, ownerName, ownerNum, sessionId, githubUrl, platform }) {
  if (user.plan === 'User' && !bot.isFeatured) {
    const err = new Error('User Account inaweza deploy Adevos-X Bot pekee. Pata Deployer Account kwa bots zaidi.');
    err.statusCode = 403;
    throw err;
  }

  const subscriptionSetting = (await Setting.findOne({ key: 'subscription' }))?.value;
  const subscriptionDays = subscriptionSetting?.defaultSubscriptionDays ?? 30;

  const deployment = await Deployment.create({
    user: user._id,
    bot: bot._id,
    ownerName,
    ownerNum,
    sessionId,
    githubUrl: githubUrl || bot.github,
    platform,
    source: user.plan === 'Deployer' ? 'Deployer' : 'User Account',
    status: 'pending',
    expiresAt: new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000),
  });

  try {
    const result = await runDeploy(platform, {
      appNamePrefix: bot.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      serverName: `${bot.name}-${ownerName}`,
      sessionId,
      ownerName,
      ownerNum,
      githubUrl: githubUrl || bot.github,
    });

    deployment.externalRef = result.externalRef;
    deployment.status = 'online';
    await deployment.save();

    await ActivityLog.create({
      icon: 'fas fa-rocket',
      text: `${bot.name} deployed by ${user.name} on ${platform}`,
    });

    return { deployment, error: null };
  } catch (err) {
    deployment.status = 'failed';
    await deployment.save();
    return { deployment, error: err };
  }
}

// POST /api/deploy  { userId, botId, ownerName, ownerNum, sessionId, githubUrl, platform }
// Use this AFTER a Paystack/manual payment has already been confirmed.
const createDeployment = asyncHandler(async (req, res) => {
  const { userId, botId, ownerName, ownerNum, sessionId, githubUrl, platform } = req.body;

  if (!userId || !botId || !ownerName || !ownerNum || !sessionId || !platform) {
    return res.status(400).json({ error: 'Fields zote zinahitajika: userId, botId, ownerName, ownerNum, sessionId, platform.' });
  }

  const [user, bot] = await Promise.all([User.findById(userId), Bot.findById(botId)]);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });
  if (!bot) return res.status(404).json({ error: 'Bot haipo.' });

  const { deployment, error } = await performDeployment({ user, bot, ownerName, ownerNum, sessionId, githubUrl, platform });
  if (error) return res.status(502).json({ error: `Deployment imeshindwa: ${error.message}`, deployment });
  res.status(201).json(deployment);
});

// POST /api/deploy/with-coins  { userId, botId, ownerName, ownerNum, sessionId, githubUrl, platform }
// Deducts AV Coins instead of requiring a cash payment (Sector 11).
const createDeploymentWithCoins = asyncHandler(async (req, res) => {
  const { userId, botId, ownerName, ownerNum, sessionId, githubUrl, platform } = req.body;

  const [user, bot, pricingSetting] = await Promise.all([
    User.findById(userId),
    Bot.findById(botId),
    Setting.findOne({ key: 'pricing' }),
  ]);
  if (!user) return res.status(404).json({ error: 'User hayupo.' });
  if (!bot) return res.status(404).json({ error: 'Bot haipo.' });

  const cost = pricingSetting?.value?.coinsPerDeploy ?? 50;
  if (user.coins < cost) {
    return res.status(402).json({ error: `AV Coins hazitoshi. Unahitaji ${cost}, una ${user.coins}.` });
  }

  user.coins -= cost;
  await user.save();

  const { deployment, error } = await performDeployment({ user, bot, ownerName, ownerNum, sessionId, githubUrl, platform });
  if (error) {
    // Refund the coins if the actual deployment call failed
    user.coins += cost;
    await user.save();
    return res.status(502).json({ error: `Deployment imeshindwa: ${error.message}`, deployment });
  }
  res.status(201).json({ deployment, remainingCoins: user.coins });
});

// POST /api/admin/deployments/:id/extend  { days }
// Admin gifts extra days without requiring payment (Table 1 & 2).
const extendSubscription = asyncHandler(async (req, res) => {
  const days = Number(req.body.days);
  if (!days || days <= 0) {
    return res.status(400).json({ error: 'Weka idadi sahihi ya siku (zaidi ya 0).' });
  }
  const deployment = await Deployment.findById(req.params.id).populate('bot', 'name').populate('user', 'name');
  if (!deployment) return res.status(404).json({ error: 'Deployment haipo.' });

  const base = deployment.expiresAt && deployment.expiresAt > new Date() ? deployment.expiresAt : new Date();
  deployment.expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  if (deployment.status === 'expired') deployment.status = 'online';
  deployment.reminderSentAt = null;
  await deployment.save();

  await ActivityLog.create({
    icon: 'fas fa-calendar-plus',
    text: `Admin gifted ${days} extra day(s) to ${deployment.bot?.name} (${deployment.user?.name})`,
  });

  res.json(deployment);
});

// Called by paymentsController once a "deployment_renewal" transaction is
// confirmed (Paystack webhook or manual verify) — extends expiry and
// brings an expired bot back online (Table 1: "Auto-Renewal").
async function renewDeployment(deploymentId) {
  const deployment = await Deployment.findById(deploymentId).populate('bot', 'name').populate('user', 'name');
  if (!deployment) return null;

  const subscriptionSetting = (await Setting.findOne({ key: 'subscription' }))?.value;
  const days = subscriptionSetting?.defaultSubscriptionDays ?? 30;
  const bonusDays = subscriptionSetting?.bonusDaysOnRenewal ?? 0;

  const base = deployment.expiresAt && deployment.expiresAt > new Date() ? deployment.expiresAt : new Date();
  deployment.expiresAt = new Date(base.getTime() + (days + bonusDays) * 24 * 60 * 60 * 1000);
  deployment.renewalCount += 1;
  deployment.reminderSentAt = null;
  if (deployment.status === 'expired') deployment.status = 'online'; // TODO: re-call platform start API if you stop bots hard on expiry
  await deployment.save();

  await ActivityLog.create({
    icon: 'fas fa-rotate',
    text: `${deployment.bot?.name} renewed by ${deployment.user?.name} — active until ${deployment.expiresAt.toDateString()}`,
  });

  return deployment;
}


const updateDeploymentStatus = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!deployment) return res.status(404).json({ error: 'Deployment haipo.' });
  res.json(deployment);
});

const deleteDeployment = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findByIdAndDelete(req.params.id);
  if (!deployment) return res.status(404).json({ error: 'Deployment haipo.' });
  res.json({ success: true, id: req.params.id });
});

module.exports = {
  getAllDeployments,
  getUserDeployments,
  createDeployment,
  createDeploymentWithCoins,
  updateDeploymentStatus,
  deleteDeployment,
  extendSubscription,
  renewDeployment,
};
