import axios from 'axios';
import { checkApi, checkSsl, checkPort, checkFrontend } from '../utils/checkers.js';
import env from "../config/env.js"
const JOBS_SERVICE_URL = env.JOBS_SERVICE_URL;

export const executeCheck = async (jobData) => {
  let result;
  const startTime = Date.now();

  try {
    switch (jobData.type) {
      case 'api':
      case 'server':
        result = await checkApi(jobData);
        break;
      case 'ssl':
        result = await checkSsl(jobData);
        break;
      case 'port':
        result = await checkPort(jobData);
        break;
      case 'frontend':
        result = await checkFrontend(jobData);
        break;
      default:
        throw new Error(`Unknown job type: ${jobData.type}`);
    }
const reportUrl = `${JOBS_SERVICE_URL}/api/job/${jobData.jobId}/stats`;

    console.log(`📡 Reporting results to: ${reportUrl}`);
    // Send the stats back to the Jobs Microservice
    await axios.patch(reportUrl, {
      jobId: jobData.jobId,
      userId: jobData.userId,
      latency: result.latency || (Date.now() - startTime),
      status: result.status,
      isValid: result.isValid,
      message: result.message
    });

  

  } catch (error) {
    console.error(`Check failed for ${jobData.jobId}:`, error.message);
  }
};