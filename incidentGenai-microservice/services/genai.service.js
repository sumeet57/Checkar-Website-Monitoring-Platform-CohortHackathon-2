
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";
import axios from "axios";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);


export const analyzeIncident = async (jobType, logs) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-001" });

  const prompt = `
    You are an expert SRE. Analyze this monitoring failure for a ${jobType} check.
    Logs: ${JSON.stringify(logs)}
    Provide a JSON response with:
    1. summary (Short description)
    2. rootCause (Technical reason for failure)
    3. suggestedFix (Actionable steps to fix it)
    IMPORTANT: Provide ONLY the raw JSON object. Do not include markdown formatting or backticks.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  // 1. Get the raw text
  let rawText = response.text().trim();

  // 2. Clean Markdown backticks if they exist
  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```json|```$/g, "").trim();
  }

  try {
    return JSON.parse(rawText);
  } catch (parseError) {
    console.error("Gemini JSON Parsing Failed. Raw text was:", rawText);
    // Fallback object so your controller doesn't crash
    return {
      summary: "Failed to parse AI report",
      rootCause: "AI response was not in valid JSON format",
      suggestedFix: "Check logs and retry check"
    };
  }
};