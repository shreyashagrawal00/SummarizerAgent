import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

export default app;