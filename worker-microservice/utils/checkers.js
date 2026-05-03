import axios from 'axios';
import tls from 'tls';
import net from 'net';
import { chromium } from 'playwright';

// API & Server Checker
export const checkApi = async (job) => {
  const start = Date.now();
  try {
    const res = await axios.get(job.url, { timeout: job.expectations.timeout || 5000 });

    const latency = Date.now() - start;

    // Body Validation if provided
    if (job.expectations.body) {
      const bodyMatch = JSON.stringify(res.data).includes(JSON.stringify(job.expectations.body));
      if (!bodyMatch) return { isValid: false, status: res.status, message: "JSON Body Mismatch", latency };
    }

    return { isValid: res.status === job.expectations.status, status: res.status, latency };
  } catch (err) {
    return { isValid: false, status: err.response?.status || 500, message: err.message };
  }
};

// Port Checker
export const checkPort = async (job) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    
    // Use the host and port provided by the user in the job setup
    const host = job.host || new URL(job.url).hostname;
    const port = job.port; 

    // Set a timeout so the worker doesn't hang forever
    socket.setTimeout(job.expectations?.timeout || 5000);

    socket.on('connect', () => {
      const latency = Date.now() - start;
      socket.destroy();
      resolve({ 
        isValid: true, 
        status: 200, 
        latency, 
        message: `Port ${port} is Open and Responding` 
      });
    });

    socket.on('error', (err) => {
      resolve({ 
        isValid: false, 
        status: 503, 
        message: `Port ${port} is Closed or Filtered: ${err.message}` 
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ 
        isValid: false, 
        status: 408, 
        message: `Connection to Port ${port} Timed Out` 
      });
    });

    socket.connect(port, host);
  });
};

// Frontend Checker (Playwright)
let browserInstance;

export const checkFrontend = async (job) => {
  const start = Date.now();
  
  try {
    if (!browserInstance) {
      browserInstance = await chromium.launch({ 
        headless: job.expectations.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
    }

    const context = await browserInstance.newContext();
    const page = await context.newPage();

    await page.goto(job.url, { 
      waitUntil: 'domcontentloaded', 
      timeout: job.expectations.timeout || 30000 
    });

    await page.waitForLoadState('networkidle');

    const contentMatch = job.expectations.contentMatch;
    const bodyText = await page.innerText('body');

    const cleanBody = bodyText.toLowerCase().replace(/[-\s]+/g, ' ');
    const cleanMatch = contentMatch.toLowerCase().replace(/[-\s]+/g, ' ');

    const isValid = cleanBody.includes(cleanMatch);

    await context.close();
    
    return {
      isValid,
      status: 200,
      latency: Date.now() - start,
      message: isValid ? "Frontend Content Verified" : `Text "${contentMatch}" missing (Fuzzy checked)`
    };

  } catch (err) {
    if (err.message.includes('browser has been closed')) browserInstance = null;
    
    return { 
      isValid: false, 
      status: 500, 
      message: `Frontend Check Error: ${err.message}` 
    };
  }
};

// SSL Checker
export const checkSsl = async (job) => {
  return new Promise((resolve) => {
    try {
      const url = new URL(job.url);
      const port = url.port || 443;

      const socket = tls.connect(port, url.hostname, { servername: url.hostname }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          return resolve({ isValid: false, status: 500, message: "No certificate found" });
        }

        const validTo = new Date(cert.valid_to);
        const now = new Date();
        
        // Calculate relative time
        const diffTime = validTo - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          return resolve({ isValid: false, status: 410, message: "SSL Expired" });
        }

        // 1. Format Relative Time
        let timeRemaining;
        if (diffDays > 365) {
          timeRemaining = `${(diffDays / 365).toFixed(1)} years`;
        } else if (diffDays > 30) {
          timeRemaining = `${(diffDays / 30).toFixed(1)} months`;
        } else {
          timeRemaining = `${diffDays} days`;
        }

        // 2. Format Exact Date (dd/mm/yyyy)
        const expiryDateStr = validTo.toLocaleDateString('en-GB'); // en-GB gives dd/mm/yyyy

        resolve({ 
          isValid: true, 
          status: 200, 
          message: `SSL Valid (valid till ${timeRemaining}, Expire on ${expiryDateStr})`,
          expiryDate: validTo,
          daysRemaining: diffDays 
        });
      });

      socket.on('error', (err) => {
        resolve({ isValid: false, status: 500, message: `SSL Error: ${err.message}` });
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({ isValid: false, status: 408, message: "SSL Handshake Timeout" });
      });

    } catch (err) {
      resolve({ isValid: false, status: 400, message: "Invalid URL for SSL check" });
    }
  });
};