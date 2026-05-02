import { scheduleDueJobs } from '../services/scheduler.service.js';

export const runSchedulerTick = async () => {
  try {
    const count = await scheduleDueJobs();
    if (count > 0) {
      console.log(`🚀 [${new Date().toLocaleTimeString()}] Scheduled ${count} jobs to Redis.`);
    }
  } catch (error) {
    console.error('❌ Tick Execution Failed:', error.message);
  }
};