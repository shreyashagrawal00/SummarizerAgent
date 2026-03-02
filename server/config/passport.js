import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback",
        accessType: "offline",
        prompt: "consent"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              user.googleId = profile.id;
            } else {
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
              });
            }
          }

          // Save Google tokens for Gmail API
          user.googleAccessToken = accessToken;
          if (refreshToken) {
            user.googleRefreshToken = refreshToken;
          }
          await user.save();

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials missing. Google Sign-In will not work.");
}