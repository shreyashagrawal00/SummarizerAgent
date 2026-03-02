import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getNewsSummary } from "../controllers/newsController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getNewsSummary);

export default router;