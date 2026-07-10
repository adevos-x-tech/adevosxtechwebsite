const { validationResult } = require('express-validator');

// Put this AFTER a list of express-validator checks on any route.
// If any check failed, responds with 400 + a clean list of messages
// instead of letting bad data reach the controller/DB.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Data uliyotuma si sahihi.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { handleValidation };
