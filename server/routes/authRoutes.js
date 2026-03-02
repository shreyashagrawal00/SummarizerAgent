import express from "express";
import { registerUser, loginUser, refreshAccessToken, createAccessToken, createRefreshToken } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
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

    res.redirect(`http://localhost:5173?token=${accessToken}&refreshToken=${refreshToken}`);
  }
);

router.post("/refresh", refreshAccessToken);




export default router;