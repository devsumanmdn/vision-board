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
      model: "gemma-3-27b-it",
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
export interface InterviewResponse {
  question?: string;
  inputType?: 'text' | 'date' | 'select' | 'chips';
  options?: string[];
  final?: boolean;
}

export interface ScheduleProposal {
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    time: string; // HH:mm
    task: string;
    activeDays: number[];
  }[];
  motivations: string[];
}

export const generateInterviewQuestion = async (
  goal: string, 
  history: {q: string, a: string}[]
): Promise<InterviewResponse> => {
  const prompt = `You are a sarcastic life coach interviewing a user about their goal: "${goal}".

Your task: Get enough info to build them a rigid daily/weekly schedule.
You need: 1) Time they can dedicate, 2) Preferred time of day, 3) Why they want this.

History: ${JSON.stringify(history)}

RULES:
- If you have enough info to build a schedule, respond ONLY with: {"final": true}
- Otherwise respond ONLY with valid JSON (no text before or after):
{"question": "Your sarcastic question here", "inputType": "text"}

RESPOND WITH JSON ONLY. NO TEXT, NO EXPLANATION.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-3-27b-it",
      contents: prompt,
    });
    const text = response.text || "{}";
    
    // Extract JSON from response (handle cases where model adds extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return { question: "I got confused. What exactly do you want to achieve?", inputType: 'text' };
    }
    
    const jsonString = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("AI Interview Error:", e);
    return { question: "Failed to think. Just tell me what you want.", inputType: 'text' };
  }
};

export const generateSchedule = async (
  goal: string,
  history: {q: string, a: string}[]
): Promise<ScheduleProposal> => {
  const prompt = `Create a schedule for the goal: "${goal}".
Based on this interview: ${JSON.stringify(history)}

RESPOND WITH VALID JSON ONLY. NO TEXT BEFORE OR AFTER.
Use this exact format:
{
  "schedule": [
    {"type": "daily", "time": "08:00", "task": "Specific task", "activeDays": [0,1,2,3,4,5,6]}
  ],
  "motivations": ["Reason 1", "Reason 2"]
}

Notes:
- type: "daily" or "weekly"
- time: 24hr format "HH:mm"
- activeDays: 0=Sunday, 1=Monday, ..., 6=Saturday

RESPOND WITH JSON ONLY.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemma-3-27b-it",
      contents: prompt,
    });
    const text = response.text || "{}";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in schedule response:", text);
      return { 
        schedule: [{ type: 'daily', time: '08:00', task: 'Work on your goal', activeDays: [1,2,3,4,5] }],
        motivations: ["Because you said so"] 
      };
    }
    
    const jsonString = jsonMatch[0].replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("AI Schedule Error:", e);
    return { 
      schedule: [{ type: 'daily', time: '08:00', task: 'Do the thing', activeDays: [0,1,2,3,4,5,6] }],
      motivations: ["Because you said so"] 
    };
  }
};
