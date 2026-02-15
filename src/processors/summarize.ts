import { isLlmAvailable, getGeminiModel } from "@/lib/gemini";
import { StepProcessor } from "./types";

function heuristicSummarize(input: string): string {
  const sentences = input
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length <= 3) {
    return sentences.join(" ");
  }

  // Return first 3 sentences as a simple summary
  return sentences.slice(0, 3).join(" ");
}

export const summarize: StepProcessor = async (input) => {
  if (!isLlmAvailable()) {
    return { output: heuristicSummarize(input), usedLlm: false };
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      `Summarize the following text concisely in 2-3 sentences.\n\n${input}`
    );
    const output = result.response.text().trim();
    if (output) {
      return { output, usedLlm: true };
    }
    return { output: heuristicSummarize(input), usedLlm: false };
  } catch {
    return { output: heuristicSummarize(input), usedLlm: false };
  }
};
