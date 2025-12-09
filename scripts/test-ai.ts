
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: EXPO_PUBLIC_GEMINI_API_KEY is not set.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateMilestones = async (goal: string) => {
  const prompt = `
    You are a cynical, sarcastic life coach.
    The user's goal is: "${goal}".
    
    Generate a 12-month breakdown breakdown.
    Return the response as a valid JSON array of objects with keys: "month", "target", "snark".
    Do NOT wrap the JSON in markdown code blocks. Just return the JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-3n-e2b-it",
      contents: prompt,
    });
    
    const text = response.text || "";
    
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const milestones = JSON.parse(jsonString);
    return milestones;
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw error;
  }
};

async function test() {
  console.log("Testing generateMilestones with gemini-1.5-flash via @google/genai...");
  
  try {
     const modelsList = await ai.models.list();
     console.log("Available models:");
     // @ts-ignore
     for await (const m of modelsList) {
         console.log(m.name);
     }
  } catch (e) {
      console.log("Failed to list models:", e);
  }

  try {
    const milestones = await generateMilestones("Test Goal");
    console.log("Success: Received " + milestones.length + " milestones.");
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
