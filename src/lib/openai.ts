import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function isLlmAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }
  return openaiClient;
}
