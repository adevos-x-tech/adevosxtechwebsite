function makeReferralCode(seed = 'USER') {
  const clean = String(seed).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'USER';
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REF-${clean}${random}`;
}

module.exports = { makeReferralCode };
