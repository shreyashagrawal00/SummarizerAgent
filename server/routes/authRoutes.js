import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  createAccessToken,
  createRefreshToken,
} from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { google } from "googleapis";

const router = express.Router();

// ─── Health check ─────────────────────────────────────────────────────────────
router.get("/health", async (req, res) => {
  try {
    await User.findOne({});
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "failed", error: err.message });
  }
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);

// ─── /me ─────────────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select(
      "-password -refreshToken -googleAccessToken"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// ─── Normal Google Sign-In/Sign-Up ────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
    accessType: "offline",
    prompt: "consent",
  })
);

// ─── Gmail Link Flow ──────────────────────────────────────────────────────────
// Separate entry point for logged-in users who want to connect Gmail.
// Uses the SAME callback URL as /google/callback (already registered in Google Console).
// Embeds the user's JWT in `state` so the callback knows to do linking, not login.
router.get("/gmail/link", (req, res) => {
  const rawToken =
    req.query.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!rawToken) return res.status(401).json({ message: "No token provided" });

  try {
    jwt.verify(rawToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Use the SAME callback URL that's already registered in Google Console
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://summarizeragent.onrender.com/api/auth/google/callback"
      : "http://localhost:5001/api/auth/google/callback");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    callbackURL
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    state: `link:${rawToken}`, // prefix so callback knows this is a link flow
  });

  res.redirect(url);
});

// ─── Shared Google Callback (handles both sign-in AND gmail linking) ──────────
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const rawState = req.query.state || "";

      // ── Gmail linking flow ────────────────────────────────────────────────
      if (rawState.startsWith("link:")) {
        const linkToken = rawState.slice(5); // strip "link:" prefix
        let linkUserId = null;

        try {
          const payload = jwt.verify(linkToken, process.env.JWT_SECRET);
          linkUserId = payload.id;
        } catch {
          // Token expired or invalid — fall through to normal login
        }

        if (linkUserId) {
          const existingUser = await User.findById(linkUserId);
          if (existingUser) {
            // Copy Google tokens onto the existing user
            existingUser.googleId = req.user.googleId || existingUser.googleId;
            existingUser.googleAccessToken = req.user.googleAccessToken;
            if (req.user.googleRefreshToken) {
              existingUser.googleRefreshToken = req.user.googleRefreshToken;
            }

            // Clean up duplicate account Passport may have created
            if (req.user._id.toString() !== linkUserId) {
              console.log(`Gmail link: deleting duplicate account ${req.user._id}`);
              await User.deleteOne({ _id: req.user._id });
            }

            const accessToken = createAccessToken(existingUser._id);
            const refreshToken = createRefreshToken(existingUser._id);
            existingUser.refreshToken = refreshToken;
            await existingUser.save();

            console.log(`Gmail link: success for ${existingUser.email}`);
            return res.redirect(
              `${clientUrl}/gmail?token=${accessToken}&refreshToken=${refreshToken}&linked=true`
            );
          }
        }
      }

      // ── Normal Google sign-in / sign-up ───────────────────────────────────
      const accessToken = createAccessToken(req.user._id);
      const refreshToken = createRefreshToken(req.user._id);
      req.user.refreshToken = refreshToken;
      await req.user.save();

      res.redirect(`${clientUrl}?token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
      console.error("Google callback error:", err);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${clientUrl}/login?error=google_failed`);
    }
  }
);

export default router;