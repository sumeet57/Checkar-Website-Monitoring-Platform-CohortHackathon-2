import Job from "../models/job.model.js";
import Log from "../models/log.model.js";
import env from "../config/env.js";
import axios from "axios";

const INCIDENT_SERVICE_URL = env.INCIDENT_SERVICE_URL || "http://localhost:5002/api/incidents";

const calculateZScore = (current, mean, stdDev) => {
  if (!stdDev || stdDev === 0) return 0;
  return (current - mean) / stdDev;
};

export const createJobService = async (jobData) => {
  return await Job.create(jobData);
};

export const getAllJobsOfUserService = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const jobs = await Job.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Job.countDocuments({ userId });
  return { jobs, total, page, totalPages: Math.ceil(total / limit) };
};

export const updateJobStatService = async (jobId, statUpdate) => {
  const { latency, status, isValid, message, userId } = statUpdate;

  // 1. Fetch History for Anomaly Detection (Last 50 logs)
  const history = await Log.find({ jobId })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  let isAnomaly = false;
  let zScore = 0;

  // 2. Anomaly Math
  if (history.length >= 10) {
    const latencies = history.map((l) => l.latency);
    const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance =
      latencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      latencies.length;
    const stdDev = Math.sqrt(variance);

    zScore = calculateZScore(latency, mean, stdDev);
    isAnomaly = zScore > 3;
  }

  // 3. Create the Log Entry (This is the Source of Truth)
  const newLog = await Log.create({
    jobId,
    latency,
    status,
    isValid,
    message,
    isAnomaly,
    zScore: zScore.toFixed(2),
  });

  // 4. Atomic Update to Job (Keep it lean - no logs array!)
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    {
      $set: {
        lastLatency: latency,
        lastStatus: isValid ? "healthy" : "down",
        lastCheck: new Date(),
      },
      $inc: { "stats.totalChecks": 1 },
    },
    { returnDocument: "after" },
  ).lean();

  // 5. Cross-Service Trigger for Incident & GenAI
  if (!isValid || status >= 500 || isAnomaly) {
    try {
      await axios.post(`${INCIDENT_SERVICE_URL}/trigger`, {
        jobId,
        userId,
        type:
          !isValid || status >= 500
            ? "CRITICAL_FAILURE"
            : "PERFORMANCE_ANOMALY",
        details: {
          latency,
          status,
          message,
          zScore: zScore.toFixed(2),
          isSingleService: true, // Useful for the AI context we discussed
        },
      });
    } catch (err) {
      console.error("Incident Microservice Unreachable:", err.message);
    }
  }

  return { updatedJob, newLog, isAnomaly };
};

export const getJobLogsService = async (jobId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  return await Log.find({ jobId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const deleteJobService = async (jobId, userId) => {
  // Good practice: Clean up logs when a job is deleted
  await Log.deleteMany({ jobId });
  return await Job.findOneAndDelete({ _id: jobId, userId });
};
export const getJobByIdService = async (jobId, userId) => {
  return await Job.findOne({ _id: jobId, userId }).lean();
};

// Handles configuration changes (e.g., changing interval or URL)
export const updateJobService = async (jobId, userId, updateData) => {
  // Use returnDocument: "after" to ensure we return the new state to the frontend
  return await Job.findOneAndUpdate(
    { _id: jobId, userId },
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  ).lean();
};


// Optimized for the Scheduler Microservice
export const getDueJobsService = async () => {
  const now = new Date();
  return await Job.find({
    isActive: true,
    $or: [
      { lastCheck: { $exists: false } },
      { 
        $expr: {
          $lte: [
            { $add: ["$lastCheck", { $multiply: ["$interval", 1000] }] },
            now
          ]
        }
      }
    ]
  })
  .select("_id url type interval lastCheck host port expectations userId") // Only what worker needs
  .lean();
};