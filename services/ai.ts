import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface Milestone {
  month: string;
  target: string; // The goal action
  snark: string;  // The sarcastic comment
}

export const generateMilestones = async (goal: string): Promise<Milestone[]> => {
  const prompt = `
    You are a cynical, sarcastic life coach who thinks the user is probably going to fail, but you are obligated to give them a plan anyway.
    The user's goal is: "${goal}".
    
    Generate a 12-month breakdown (Milestones) for this goal.
    For each month, provide:
    1. A concrete action (target).
    2. A biting, sarcastic comment or reality check (snark) about why this is hard or why they might quit.

    Return the response as a valid JSON array of objects with keys: "month" (e.g., "Month 1"), "target", "snark".
    Do NOT wrap the JSON in markdown code blocks. Just return the JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-3n-e2b-it",
      contents: prompt,
    });
    
    // The response.text property contains the generated text
    const text = response.text || "";
    
    // Cleanup simple formatting if the model adds it
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const milestones: Milestone[] = JSON.parse(jsonString);
    return milestones;
  } catch (error) {
    console.error("AI Generation Failed:", error);
    // Fallback Mock Data for Demo/Error
    return [
      { month: "Month 1", target: "Start trying (maybe)", snark: "This is the easy part." },
      { month: "Month 2", target: "Don't quit yet", snark: "Most people give up by now. Following the trend?" },
      { month: "Month 3", target: "Actually do something", snark: "Shocking you made it this far." },
    ];
  }
};
