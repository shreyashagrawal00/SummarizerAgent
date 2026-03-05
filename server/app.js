import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import gmailRoutes from "./routes/gmailRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";
import "./config/passport.js";

const app = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000 // Increased for development
});

app.use(limiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/web", webRoutes);
app.use("/api/chat", chatRoutes);

export default app;