import Redis from 'ioredis';
import dotenv from 'dotenv';
import { executeCheck } from './services/worker.service.js';

dotenv.config();

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

redis.on("connect", () => console.log("✅ Scheduler: Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));
const QUEUE_NAME = 'task-queue';

const startWorker = async () => {
  console.log("🚀 Worker is online and waiting for tasks...");

  while (true) {
    try {
      // BRPOP blocks the loop until a task is available (efficient!)
      const task = await redis.brpop(QUEUE_NAME, 0); 
      
      if (task) {
        const jobData = JSON.parse(task[1]);
        console.log(`Checking [${jobData.type}]: ${jobData.url || jobData.host}`);
        
        // Execute the check (API, SSL, Port, or Frontend)
        await executeCheck(jobData);
      }
    } catch (error) {
      console.error("Worker Loop Error:", error.message);
      // Small delay to prevent infinite rapid crashing
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

startWorker();