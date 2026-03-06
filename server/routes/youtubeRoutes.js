import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { summarizeYoutube, getTranscript } from "../controllers/youtubeController.js";

const router = express.Router();

router.get("/transcript", authMiddleware, getTranscript);
router.post("/summarize", authMiddleware, summarizeYoutube);

export default router;