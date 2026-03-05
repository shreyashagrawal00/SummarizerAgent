import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { summarizeWebpage } from "../controllers/webController.js";

const router = express.Router();

router.post("/summarize", authMiddleware, summarizeWebpage);

export default router;
