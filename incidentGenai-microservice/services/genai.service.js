
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";
import axios from "axios";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);


export const analyzeIncident = async (jobType, logs) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  
  let rawText = response.text().trim();

  if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```json|```$/g, "").trim();
  }

  try {
    const parsedData = JSON.parse(rawText);

    const formatField = (field) => {
      if (Array.isArray(field)) {
        return field.join(" ");
      }
      return field;
    };

    return {
      summary: formatField(parsedData.summary),
      rootCause: formatField(parsedData.rootCause),
      suggestedFix: formatField(parsedData.suggestedFix)
    };

  } catch (parseError) {
    console.error("Gemini JSON Parsing Failed. Raw text was:", rawText);
    return {
      summary: "Failed to parse AI report",
      rootCause: "AI response was not in valid JSON format",
      suggestedFix: "Check logs and retry check"
    };
  }
};