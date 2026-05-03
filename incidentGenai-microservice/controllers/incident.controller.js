import Incident from "../models/incident.model.js";
import Notification from "../models/notification.model.js";
import { analyzeIncident } from "../services/genai.service.js";

export const handleIncidentTrigger = async (req, res) => {
  const { jobId, userId, type, triggerGenAI, details } = req.body;

  try {
    if (triggerGenAI) {
      // 🧠 1. Complex Case: Create Incident with AI Report
      const aiResult = await analyzeIncident(type, details);
      
      await Incident.create({
        jobId,
        userId,
        type, 
        aiReport: {
          summary: aiResult.summary,
          rootCause: aiResult.rootCause,
          suggestedFix: aiResult.suggestedFix
        },
        rawLogs: details
      });

      // 📢 Minimalist Notification for AI-ready incidents
      await Notification.create({
        userId,
        jobId,
        title: type.replace(/_/g, ' '), 
        message: "AI root-cause analysis is ready.",
        type: "PERFORMANCE"
      });

    } else {
      // 📢 2. Simple Case: Only create a Notification
      // Use the 'message' provided by the worker (e.g., "Status 500" or "Text missing")
      await Notification.create({
        userId,
        jobId,
        title: type.replace(/_/g, ' '), 
        message: details.message || "Manual check required.",
        type: "CRITICAL"
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Incident Service Error:", error.message);
    res.status(500).json({ error: "Failed to process trigger" });
  }
};