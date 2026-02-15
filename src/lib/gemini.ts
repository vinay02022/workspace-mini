import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let geminiModel: GenerativeModel | null = null;

export function isLlmAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModel(): GenerativeModel {
  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return geminiModel;
}
