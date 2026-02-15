import { StepProcessor } from "./types";

export const cleanText: StepProcessor = async (input) => {
  let output = input.trim();

  // Normalize whitespace: replace multiple spaces/tabs with single space
  output = output.replace(/[^\S\n]+/g, " ");

  // Collapse multiple blank lines into a single blank line
  output = output.replace(/\n{3,}/g, "\n\n");

  // Trim each line
  output = output
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return { output, usedLlm: false };
};
