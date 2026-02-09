import mongoose from "mongoose";

export async function connectDB() {
  try {
    // If already connected → reuse
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    return conn;

  } catch (error) {
    console.error("❌ Mongo connection error:", error.message);
    throw error;
  }
}
