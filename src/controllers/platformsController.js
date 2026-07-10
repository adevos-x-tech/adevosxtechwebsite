const Platform = require('../models/Platform');
const asyncHandler = require('../utils/asyncHandler');
const { REGISTRY } = require('../utils/dynamicDeploy');

// GET /api/public/platforms — only what users are allowed to pick, in order.
const getActivePlatforms = asyncHandler(async (req, res) => {
  const platforms = await Platform.find({ isActive: true }).sort({ position: 1 }).select('-envKeyHint');
  res.json(platforms);
});

// GET /api/admin/platforms — admin sees everything, plus whether each
// platform actually has a working service module wired up yet.
const getAllPlatforms = asyncHandler(async (req, res) => {
  const platforms = await Platform.find().sort({ position: 1 });
  const withStatus = platforms.map((p) => ({
    ...p.toObject(),
    hasServiceModule: Boolean(REGISTRY[p.slug]),
  }));
  res.json(withStatus);
});

const createPlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.create(req.body);
  res.status(201).json(platform);
});

const updatePlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!platform) return res.status(404).json({ error: 'Platform haipo.' });
  res.json(platform);
});

const deletePlatform = asyncHandler(async (req, res) => {
  const platform = await Platform.findByIdAndDelete(req.params.id);
  if (!platform) return res.status(404).json({ error: 'Platform haipo.' });
  res.json({ success: true, id: req.params.id });
});

module.exports = { getActivePlatforms, getAllPlatforms, createPlatform, updatePlatform, deletePlatform };
