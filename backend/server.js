import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();

/* ---------- CORS ---------- */
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));

/* ---------- Middleware ---------- */
app.use(express.json());

/* ---------- Routes ---------- */
app.use("/auth", authRoutes);

/* ---------- Test ---------- */
app.get("/", (req, res) => {
  res.send("Backend running...");
});

/* ---------- DB ---------- */
await connectDB();

/* ---------- Start ---------- */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT} 🚀`)
);
