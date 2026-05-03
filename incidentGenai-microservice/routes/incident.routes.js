import express from 'express';
import { handleIncidentTrigger, triggerIncident } from '../controllers/incident.controller.js';

const router = express.Router();

router.post('/trigger', handleIncidentTrigger);

export default router;