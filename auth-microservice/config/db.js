import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB_URI);
    console.log("connected to mongodb");
  } catch (error) {
    console.log("connection failed to mongodb");
    process.exit(1);
  }
};
