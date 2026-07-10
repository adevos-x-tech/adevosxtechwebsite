const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const { DEFAULTS } = require('../seed/defaults');

const ALLOWED_KEYS = ['social', 'links', 'music', 'notifications', 'pricing', 'deployer', 'subscription'];

function assertKnownKey(key) {
  if (!ALLOWED_KEYS.includes(key)) {
    const err = new Error(`Setting key isiyotambulika: "${key}"`);
    err.statusCode = 400;
    throw err;
  }
}

// GET /api/public/settings/:key  and  GET /api/admin/settings/:key
const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  assertKnownKey(key);
  let doc = await Setting.findOne({ key });
  if (!doc) {
    // Self-heal: if nobody has seeded this bucket yet, fall back to defaults
    doc = await Setting.create({ key, value: DEFAULTS.settings[key] });
  }
  res.json(doc.value);
});

// GET /api/public/settings  -> every bucket at once (handy for one page-load fetch)
const getAllSettings = asyncHandler(async (req, res) => {
  const docs = await Setting.find({ key: { $in: ALLOWED_KEYS } });
  const map = {};
  for (const k of ALLOWED_KEYS) map[k] = DEFAULTS.settings[k];
  docs.forEach((d) => (map[d.key] = d.value));
  res.json(map);
});

// PUT /api/admin/settings/:key
const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  assertKnownKey(key);
  const doc = await Setting.findOneAndUpdate(
    { key },
    { key, value: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(doc.value);
});

module.exports = { getSetting, getAllSettings, updateSetting, ALLOWED_KEYS };
