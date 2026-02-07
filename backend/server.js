import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Connect to MongoDB ----------------
(async () => {
  try {
    await connectDB();
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Stop server if DB fails
  }
})();

// ---------------- Routes ----------------
app.use("/auth", authRoutes);
app.use("/posts", blogRoutes);

// ---------------- Error handlers ----------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT} 🚀`));
