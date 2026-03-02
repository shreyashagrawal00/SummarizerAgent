import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getNewsSummary, getNews, summarizeOne } from "../controllers/newsController.js";

const router = express.Router();

router.get("/", authMiddleware, getNews);
router.get("/summary", authMiddleware, getNewsSummary);
router.post("/summarize-one", authMiddleware, summarizeOne);

export default router;