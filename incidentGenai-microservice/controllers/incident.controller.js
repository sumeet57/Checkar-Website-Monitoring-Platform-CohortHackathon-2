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


export const getIncidents = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { jobId, status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('jobId', 'name url');

    const total = await Incident.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      incidents
    });
  } catch (error) {
    next(error);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const { incidentId } = req.params;
    const userId = req.userId;

    const incident = await Incident.findOne({ _id: incidentId, userId })
      .populate('jobId');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    res.status(200).json({
      success: true,
      incident
    });
  } catch (error) {
    next(error);
  }
};

export const getIncidentStats = async (req, res, next) => {
  try {
   const userId = req.userId;

    const stats = await Incident.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};