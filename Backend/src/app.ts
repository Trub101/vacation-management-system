import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { assertDbConnection } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import vacationsRoutes from "./routes/vacations.routes.js";
import likesRoutes from "./routes/likes.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import mcpRoutes from "./routes/mcp.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Allow the React dev server (Vite:5173) and the dockerised frontend (Nginx:3000).
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "vacations-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/vacations", vacationsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mcp", mcpRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await assertDbConnection();
    console.log("[db] Connected to MySQL");
  } catch (err) {
    console.error("[db] Could not connect to MySQL:", (err as Error).message);
    console.error("[db] Is the MySQL container running on the configured host/port?");
  }
  app.listen(PORT, () => {
    console.log(`[server] Vacations API listening on http://localhost:${PORT}`);
  });
}

start();
