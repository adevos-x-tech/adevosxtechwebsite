const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { makeReferralCode } = require('../utils/referral');

async function findOrCreateOAuthUser({ provider, providerId, name, email, avatar }) {
  const idField = provider === 'google' ? 'googleId' : 'githubId';
  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  // If someone already signed up manually with this email, link the account
  user = email ? await User.findOne({ email }) : null;
  if (user) {
    user[idField] = providerId;
    user.provider = provider;
    if (avatar && !user.profilePicUrl) user.profilePicUrl = avatar;
    await user.save();
    return user;
  }

  user = await User.create({
    name: name || 'Adevos User',
    email: email || `${provider}_${providerId}@no-email.adevosx.site`,
    provider,
    [idField]: providerId,
    profilePicUrl: avatar || '',
    referralCode: makeReferralCode(name || providerId),
  });
  return user;
}

// Google strategy only registers if credentials exist — this means the
// server still boots cleanly before you've set up Google Cloud Console.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: 'google',
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: 'github',
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

module.exports = passport;
