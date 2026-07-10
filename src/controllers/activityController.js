const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
  res.json(logs);
});

const clearActivity = asyncHandler(async (req, res) => {
  await ActivityLog.deleteMany({});
  res.json({ success: true });
});

module.exports = { getActivity, clearActivity };
