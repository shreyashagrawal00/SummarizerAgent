import express from "express";
import { registerUser, loginUser, refreshAccessToken, createAccessToken, createRefreshToken } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
    accessType: "offline",
    prompt: "consent"
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const accessToken = createAccessToken(req.user._id);
    const refreshToken = createRefreshToken(req.user._id);

    // Save refresh token to user if needed
    req.user.refreshToken = refreshToken;
    await req.user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}?token=${accessToken}&refreshToken=${refreshToken}`);
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
    const user = await User.findById(payload.id).select("-password -refreshToken -googleAccessToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});




export default router;