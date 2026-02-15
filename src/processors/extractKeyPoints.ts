import { isLlmAvailable, getOpenAIClient } from "@/lib/openai";
import { StepProcessor } from "./types";

function heuristicExtractKeyPoints(input: string): string {
  const sentences = input
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  // Sort by length (longer sentences tend to be more substantive) and pick top 5
  const sorted = [...sentences].sort((a, b) => b.length - a.length);
  const top = sorted.slice(0, 5);

  // Return as bullet points in original order
  const ordered = sentences.filter((s) => top.includes(s)).slice(0, 5);
  return ordered.map((s) => `- ${s}`).join("\n");
}

export const extractKeyPoints: StepProcessor = async (input) => {
  if (!isLlmAvailable()) {
    return { output: heuristicExtractKeyPoints(input), usedLlm: false };
  }

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Extract the key points from the following text. Return them as a bullet-point list using '- ' prefix for each point.",
        },
        { role: "user", content: input },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const output = response.choices[0]?.message?.content?.trim();
    if (output) {
      return { output, usedLlm: true };
    }
    return { output: heuristicExtractKeyPoints(input), usedLlm: false };
  } catch {
    return { output: heuristicExtractKeyPoints(input), usedLlm: false };
  }
};
