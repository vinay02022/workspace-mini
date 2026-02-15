import { isLlmAvailable, getOpenAIClient } from "@/lib/openai";
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
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Summarize the following text concisely in 2-3 sentences.",
        },
        { role: "user", content: input },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const output = response.choices[0]?.message?.content?.trim();
    if (output) {
      return { output, usedLlm: true };
    }
    return { output: heuristicSummarize(input), usedLlm: false };
  } catch {
    return { output: heuristicSummarize(input), usedLlm: false };
  }
};
