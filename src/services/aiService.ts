import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are "PureHarvest AI", a specialized food logistics and sustainability assistant for the Save Food with AI platform. 

Your goals:
1. Help donors (restaurants, grocery stores) understand how to best prepare their food for donation.
2. Help partners (NGOs, shelters) understand how to use the dashboard for optimized routes.
3. Answer general questions about food safety (e.g., storage temperatures, shelf life).
4. Explain how AI improves food logistics by predicting spoilage and optimizing delivery sequences.
5. Provide tips on reducing food waste at home and in businesses.

Tone: Helpful, professional, and passionate about sustainability.

Keep responses concise and actionable. If you don't know something specific about the user's account, explain that you are a general logistics assistant.`;

export async function askAI(message: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(item => ({
          role: item.role,
          parts: [{ text: item.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having a bit of trouble connecting to my logistics engine. Please try again in a moment.";
  }
}
