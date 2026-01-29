import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(retries = MAX_RETRIES) {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌ MONGO_URI is missing in .env");

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    if (retries > 0) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error("❌ Could not connect to MongoDB. Exiting.");
    process.exit(1);
  }
}
