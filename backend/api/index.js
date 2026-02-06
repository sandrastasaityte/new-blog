import dotenv from "dotenv";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
      console.log("Database connected ✅");
    }
    return app(req, res);
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
}
