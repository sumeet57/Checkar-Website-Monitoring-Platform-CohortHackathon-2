import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["api", "server", "ssl", "port", "frontend", "cronjob"],
    },
    url: {
      type: String,
      required: function () {
        return this.type !== "port";
      }, // not required for Port Monitoring
    },
    host: {
      type: String, // for port monitoring, otherwise it will blank
      default: "",
    },
    port: {
      type: Number, // Port number for TCP check
      default: null,
    },
    interval: {
      type: Number,
      default: 60, // Default 60 seconds interval
      min: 30,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE"],
      default: "GET",
    },

    // Validation Logic (Expected Results)
    expectations: {
      status: { type: Number, default: 200 },
      timeout: { type: Number, default: 5000 },
      body: { type: mongoose.Schema.Types.Mixed }, // For API JSON validation

      // Frontend-specific expectations
      selector: { type: String, }, // CSS selector to wait for (e.g., "#root")
      contentMatch: { type: String }, // Specific text to look for on page
      checkConsole: { type: Boolean, default: false }, // Scrape JS errors
      headless: { type: Boolean, default: true }, // Browser mode
    },

    // State Management
    isActive: {
      type: Boolean,
      default: true,
    },
    lastStatus: {
      type: String,
      enum: ["healthy", "degraded", "down", "pending"],
      default: "pending",
    },
    lastLatency: {
      type: Number,
      default: 0,
    },
    lastCheck: {
      type: Date,
    },

    // Statistical Metadata for Anomaly Detection
    stats: {
      meanLatency: { type: Number, default: 0 },
      stdDevLatency: { type: Number, default: 0 },
      totalChecks: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// CRITICAL: Compound index for the Scheduler
jobSchema.index({ isActive: 1, lastCheck: 1 });

// Index for User-specific lookups
jobSchema.index({ userId: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
