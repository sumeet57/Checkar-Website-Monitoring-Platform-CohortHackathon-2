import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  latency: { type: Number, required: true },
  status: { type: Number },
  isValid: { type: Boolean, required: true },
  message: { type: String },
  isAnomaly: { type: Boolean, default: false }, // New field
  zScore: { type: String, default: "0" }, // New field
  timestamp: { type: Date, default: Date.now },
});

// OPTIMIZATION: Auto-delete logs after 30 days (2592000 seconds)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const Log = mongoose.model("Log", logSchema);

export default Log;
