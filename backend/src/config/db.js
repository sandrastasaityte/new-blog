import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const conn = await mongoose.connect(process.env.MONGO_URI);

  isConnected = true;

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
}
