import { connectDB } from './config/db.js';
import { runSchedulerTick } from './controllers/scheduler.controller.js';
import env from './config/env.js';

// Connect to Database
connectDB();

// Scheduler Loop: Runs every 10 seconds
// You can adjust this based on how fast your Redis queue clears
const TICK_INTERVAL = 10000; 

console.log("⏱️ Scheduler Microservice started...");

setInterval(async () => {
  await runSchedulerTick();
}, TICK_INTERVAL);