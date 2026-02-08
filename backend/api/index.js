import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return app(req, res);
}
