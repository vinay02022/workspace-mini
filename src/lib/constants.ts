export const STEP_TYPES = [
  { value: "clean_text", label: "Clean Text", description: "Trim, normalize whitespace, collapse blank lines" },
  { value: "summarize", label: "Summarize", description: "Summarize text (LLM or first N sentences)" },
  { value: "extract_key_points", label: "Extract Key Points", description: "Extract key points as bullets" },
  { value: "tag_category", label: "Tag Category", description: "Categorize text with tags" },
] as const;

export type StepType = (typeof STEP_TYPES)[number]["value"];

export const MIN_STEPS = 2;
export const MAX_STEPS = 4;
export const DEFAULT_RUNS_LIMIT = 5;

// Input validation limits
export const MAX_INPUT_TEXT_LENGTH = 10_000; // Max characters for pipeline input text
export const MAX_WORKFLOW_NAME_LENGTH = 100; // Max characters for workflow name
export const MAX_WORKFLOW_DESCRIPTION_LENGTH = 500; // Max characters for workflow description
export const MAX_RUNS_LIMIT = 50; // Max number of runs to fetch at once

