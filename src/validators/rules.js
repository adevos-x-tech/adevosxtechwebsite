const { body } = require('express-validator');

const adminLoginRules = [
  body('username').trim().notEmpty().withMessage('Username inahitajika.'),
  body('password').isString().isLength({ min: 4 }).withMessage('Password fupi mno.'),
];

const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Jina fupi mno.'),
  body('email').trim().isEmail().withMessage('Email si sahihi.').normalizeEmail(),
];

const deployRules = [
  body('userId').isMongoId().withMessage('userId si sahihi.'),
  body('botId').isMongoId().withMessage('botId si sahihi.'),
  body('ownerName').trim().notEmpty().withMessage('Owner name inahitajika.'),
  body('ownerNum').trim().isLength({ min: 8 }).withMessage('Owner number si sahihi.'),
  body('sessionId').trim().notEmpty().withMessage('Session ID inahitajika.'),
  body('platform').trim().notEmpty().withMessage('Platform inahitajika.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('GitHub URL si sahihi.'),
];

const createUserRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Jina fupi mno.'),
  body('email').trim().isEmail().withMessage('Email si sahihi.').normalizeEmail(),
  body('plan').optional().isIn(['User', 'Deployer']).withMessage('Plan si sahihi.'),
];

const giftCoinsRules = [body('amount').isFloat({ gt: 0 }).withMessage('Amount lazima iwe zaidi ya 0.')];

const messageUserRules = [
  body('subject').trim().notEmpty().withMessage('Subject inahitajika.'),
  body('message').trim().notEmpty().withMessage('Message inahitajika.'),
];

module.exports = {
  adminLoginRules,
  registerRules,
  deployRules,
  createUserRules,
  giftCoinsRules,
  messageUserRules,
};
