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
