import express from "express";
import * as jobController from "../controllers/job.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// User-Facing Routes
router.post("/", authenticateToken, jobController.createJob); // Create a new monitor
router.get("/", authenticateToken, jobController.getAllJobsOfUser); // Get user monitors (Paginated)
router.get("/:id", authenticateToken, jobController.getJobById); // Get specific monitor details
router.put("/:id", authenticateToken, jobController.updateJob); // Update monitor config
router.delete("/:id", authenticateToken, jobController.deleteJob); // Delete a monitor
router.get("/:id/logs", authenticateToken, jobController.getJobLogs);

// Internal/System Routes
router.get("/system/all", jobController.getAllJobs); // For Scheduler (Internal use)
router.patch("/:id/stats", jobController.updateJobStat); // For Worker (Update latency/status)

export default router;
