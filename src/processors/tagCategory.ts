import { isLlmAvailable, getGeminiModel } from "@/lib/gemini";
import { StepProcessor } from "./types";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  technology: ["software", "computer", "ai", "algorithm", "data", "digital", "code", "programming", "tech", "machine learning", "api", "cloud"],
  business: ["market", "revenue", "profit", "company", "startup", "investment", "sales", "customer", "growth", "strategy"],
  science: ["research", "experiment", "hypothesis", "study", "analysis", "discovery", "scientific", "theory", "evidence"],
  health: ["medical", "health", "disease", "treatment", "patient", "clinical", "wellness", "therapy", "diagnosis"],
  education: ["learn", "student", "teach", "school", "university", "course", "training", "academic", "curriculum"],
  politics: ["government", "policy", "election", "political", "law", "regulation", "vote", "legislation"],
  environment: ["climate", "environment", "sustainable", "energy", "pollution", "ecosystem", "carbon", "renewable"],
};

function heuristicTagCategory(input: string): string {
  const lowerInput = input.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.reduce((score, keyword) => {
      const regex = new RegExp(keyword, "gi");
      const matches = lowerInput.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    return "Tags: general";
  }

  const topTags = sorted.slice(0, 3).map(([category]) => category);
  return `Tags: ${topTags.join(", ")}`;
}

export const tagCategory: StepProcessor = async (input) => {
  if (!isLlmAvailable()) {
    return { output: heuristicTagCategory(input), usedLlm: false };
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      `Categorize the following text with relevant tags. Return in the format "Tags: tag1, tag2, tag3". Use 1-3 tags from these categories: technology, business, science, health, education, politics, environment, or suggest a more specific tag if appropriate.\n\n${input}`
    );
    const output = result.response.text().trim();
    if (output) {
      return { output, usedLlm: true };
    }
    return { output: heuristicTagCategory(input), usedLlm: false };
  } catch {
    return { output: heuristicTagCategory(input), usedLlm: false };
  }
};
