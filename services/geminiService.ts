import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsight = async (context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are the AI engine for HeadlightSEO. Analyze the provided site data and return a very simple, 1-2 sentence summary. Focus on the most important error and what to do about it. Do not use technical jargon. Speak like a helpful consultant.",
      },
      contents: context,
    });

    return response.text || "Analysis complete. Review specific sections for details.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "AI Analysis temporarily unavailable. Please check your connection.";
  }
};

export const chatWithCopilot = async (
  message: string, 
  history: {role: 'user' | 'ai', text: string}[]
): Promise<string> => {
  try {
    // Map internal history format to Gemini API format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are HeadlightSEO's AI Copilot. You help business owners understand their website performance. Explain things in very simple, plain English. Avoid complex SEO jargon like 'canonicalization' or 'link equity' unless you explain them simply first. Be helpful and concise.",
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: message });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Copilot Error:", error);
    return "I'm having trouble connecting to the HeadlightSEO intelligence network. Please try again in a moment.";
  }
}