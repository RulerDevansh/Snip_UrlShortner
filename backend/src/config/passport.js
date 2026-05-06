const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email returned from Google'), null);
        }

        let user = await User.findOne({ where: { google_id: profile.id } });

        if (!user) {
          // Check if account exists with same email (link accounts)
          user = await User.findOne({ where: { email } });
          if (user) {
            await user.update({ google_id: profile.id });
          } else {
            user = await User.create({
              email,
              name: profile.displayName,
              google_id: profile.id,
              password: null,
            });
          }
        }

        const token = generateToken({ id: user.id, email: user.email });
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
