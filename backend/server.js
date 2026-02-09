import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";

import {
  notFound,
  errorHandler
} from "./src/middleware/errorMiddleware.js";

dotenv.config();

const app = express();

/* =========================================================
   CORS (Production Safe)
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true
  })
);

/* =========================================================
   Middleware
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   Health Check
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend running 🚀"
  });
});

/* =========================================================
   API Routes
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

/* =========================================================
   404 + Error Handling
========================================================= */

app.use(notFound);
app.use(errorHandler);

/* =========================================================
   Database Connection + Server Start
========================================================= */

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
