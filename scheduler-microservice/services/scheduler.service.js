import Job from '../models/job.model.js';
import { redis } from '../config/db.js';

export const scheduleDueJobs = async () => {
  const now = new Date();
  try {
    // Find jobs due for check based on (lastCheck + interval) <= now
    const jobsDue = await Job.find({
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
    }).lean();

    if (jobsDue.length === 0) return 0;

    const pipeline = redis.pipeline();
    
    jobsDue.forEach((job) => {
      const payload = JSON.stringify({
        jobId: job._id,
        type: job.type,
        url: job.url,
        host: job.host,
        port: job.port,
        expectations: job.expectations,
        userId: job.userId
      });
      pipeline.lpush('task-queue', payload);
    });

    await pipeline.exec();

    // Update lastCheck immediately to prevent re-scheduling in the next loop
    const jobIds = jobsDue.map(j => j._id);
    await Job.updateMany(
      { _id: { $in: jobIds } },
      { $set: { lastCheck: now } }
    );

    return jobsDue.length;
  } catch (error) {
    console.error('Scheduler Service Error:', error.message);
    throw error;
  }
};