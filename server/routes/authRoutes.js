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

const router = express.Router();

// ─── Health check — visit /api/auth/health to verify DB is connected ──────────
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

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const accessToken = createAccessToken(req.user._id);
      const refreshToken = createRefreshToken(req.user._id);

      req.user.refreshToken = refreshToken;
      await req.user.save();

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(
        `${clientUrl}?token=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err) {
      console.error("Google callback error:", err);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${clientUrl}/login?error=google_failed`);
    }
  }
);

router.post("/refresh", refreshAccessToken);

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select(
      "-password -refreshToken -googleAccessToken"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;