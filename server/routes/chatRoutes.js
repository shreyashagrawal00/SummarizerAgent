import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { handleChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/ask", authMiddleware, handleChat);

export default router;
