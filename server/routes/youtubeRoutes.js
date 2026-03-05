import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { summarizeYoutube } from "../controllers/youtubeController.js";

const router = express.Router();

router.post("/summarize", authMiddleware, summarizeYoutube);

export default router;
