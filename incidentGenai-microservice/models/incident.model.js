import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., "CRITICAL_FAILURE", "PERFORMANCE_ANOMALY"
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  aiReport: {
    summary: String,
    rootCause: String,
    suggestedFix: String,
  },
  rawLogs: mongoose.Schema.Types.Mixed, // The failure data sent by the worker
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);