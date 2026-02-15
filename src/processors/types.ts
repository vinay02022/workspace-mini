export interface StepResult {
  output: string;
  usedLlm: boolean;
}

export type StepProcessor = (
  input: string,
  config?: Record<string, unknown>
) => Promise<StepResult>;
