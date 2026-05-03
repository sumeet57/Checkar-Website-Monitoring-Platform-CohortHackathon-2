import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const analyzeIncident = async (jobType, logs) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert SRE. Analyze this monitoring failure for a ${jobType} check.
    Logs: ${JSON.stringify(logs)}
    Provide a JSON response with:
    1. summary (Short description)
    2. rootCause (Technical reason for failure)
    3. suggestedFix (Actionable steps to fix it)
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text()); // Ensure Gemini returns valid JSON
};