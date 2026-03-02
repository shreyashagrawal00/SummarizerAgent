import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import gmailRoutes from "./routes/gmailRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";
import "./config/passport.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

app.use(limiter);

app.use(helmet());

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gmail", gmailRoutes);

export default app;