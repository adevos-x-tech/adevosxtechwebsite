const rateLimit = require('express-rate-limit');

// Slows down brute-force attempts on login endpoints.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Majaribio mengi ya kuingia. Jaribu tena baada ya dakika chache.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter so the whole app can't be hammered on the free tier.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Maombi mengi kwa muda mfupi. Pumzika kidogo.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Deploy endpoints hit external APIs (Heroku/Pterodactyl) and cost real
// resources, so they get a tighter limit than general API traffic
// (Table 6, High priority).
const deployLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Umefikia kikomo cha deployments kwa saa hii. Jaribu tena baadaye.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter, deployLimiter };
