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
      console.log("✅ MongoDB connected");
    }

    return app(req, res);
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
