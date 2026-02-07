import mongoose from "mongoose";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export async function connectDB(retries = MAX_RETRIES) {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌ MONGO_URI missing in .env");

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    if (retries > 0) {
      const delay = BASE_DELAY_MS * 2 ** (MAX_RETRIES - retries);
      console.log(`⏳ Retrying in ${delay / 1000}s... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retries - 1);
    }
    throw new Error("❌ Could not connect to MongoDB after multiple attempts.");
  }
}
