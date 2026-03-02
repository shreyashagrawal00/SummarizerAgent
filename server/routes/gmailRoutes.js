import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getEmails, summarizeEmails, summarizeOneEmail } from "../controllers/gmailController.js";

const router = express.Router();

router.get("/", authMiddleware, getEmails);
router.get("/summary", authMiddleware, summarizeEmails);
router.post("/summarize-one", authMiddleware, summarizeOneEmail);

export default router;
