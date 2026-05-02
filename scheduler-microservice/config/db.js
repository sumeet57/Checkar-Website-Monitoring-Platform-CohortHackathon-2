import mongoose from 'mongoose';
import Redis from 'ioredis';
import env from "./env.js"

export const connectDB = async () => {
  try {
    await mongoose.connect(env.DB_URI);
    console.log("✅ Scheduler: MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export const redis = new Redis(env.REDIS_URL);