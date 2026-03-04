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
          console.log("Google Auth: Profile received for", profile.displayName, profile.emails?.[0]?.value);
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            console.log("Google Auth: User not found by googleId, checking by email...");
            if (!profile.emails || profile.emails.length === 0) {
              console.warn("Google Auth: No email found in profile");
              return done(new Error("No email associated with Google account"), null);
            }
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              console.log("Google Auth: User found by email, linking googleId...");
              user.googleId = profile.id;
            } else {
              console.log("Google Auth: Creating new user...");
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
              });
            }
          }

          // Save Google tokens for Gmail API
          console.log("Google Auth: Saving tokens and user...");
          user.googleAccessToken = accessToken;
          if (refreshToken) {
            user.googleRefreshToken = refreshToken;
          }
          await user.save();
          console.log("Google Auth: Authentication successful for", user.email);

          done(null, user);
        } catch (error) {
          console.error("Google Auth Strategy Error:", error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials missing. Google Sign-In will not work.");
}