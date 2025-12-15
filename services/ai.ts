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
  const prompt = `You are a witty, slightly sarcastic but genuinely helpful AI assistant helping someone plan their goal: "${goal}".

CONVERSATION HISTORY: ${JSON.stringify(history)}

YOUR PERSONALITY:
- Warm and encouraging with a dash of playful humor
- Make jokes that land, not cringe
- Be genuinely curious and empathetic
- Think like a friend who happens to be a great life coach

WHAT YOU NEED (but be smart about getting it):
1. Roughly how much time they can dedicate (daily/weekly)
2. When in their day works best (morning person? night owl? lunch breaks?)  
3. What's driving this goal (optional - infer from context if obvious)

INTELLIGENCE RULES:
- INFER from context! If the goal is "run a marathon" and they mention "before work", assume they're a morning person
- If they say "an hour a day" - that's time AND commitment covered
- If motivation is obvious from the goal (like "lose weight for wedding"), don't ask why
- After 2-3 exchanges MAX, you should have enough to work with. Don't interrogate.
- Ask ONE question at a time, but make it conversational and open-ended

WHEN TO FINISH:
- You have a rough idea of time commitment (can be vague like "an hour" or "weekends")
- You know roughly when in the day works
- OR you've had 3+ exchanges already (just work with what you have!)

RESPONSE FORMAT:
- If ready to create schedule: {"final": true}
- Otherwise: {"question": "Your friendly, witty question here", "inputType": "text"}

RESPOND WITH JSON ONLY. Nothing else.`;

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
  const prompt = `Create a realistic, achievable schedule for the goal: "${goal}".

INTERVIEW CONTEXT: ${JSON.stringify(history)}

YOUR TASK:
Create a schedule that actually fits their life. Be realistic, not aspirational.
- If they said "30 mins a day" don't give them 3 different daily tasks
- If they're a night owl, don't schedule 6am workouts
- Start small - consistency beats intensity

SCHEDULE GUIDELINES:
- 1-3 scheduled items MAX (less is more!)
- Be specific about the task (not "work on goal" but "practice guitar scales")
- Match their energy and availability

MOTIVATIONS:
Write 2-3 motivation lines that are:
- Actually motivating, not generic
- Mix of sincere and playfully sarcastic
- Personal to their specific goal
- The kind of thing a supportive friend would text you

FORMAT (RESPOND WITH VALID JSON ONLY):
{
  "schedule": [
    {"type": "daily", "time": "08:00", "task": "Specific actionable task", "activeDays": [0,1,2,3,4,5,6]}
  ],
  "motivations": ["Motivating line 1", "Slightly sarcastic but supportive line 2"]
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
