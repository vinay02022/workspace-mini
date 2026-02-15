import { StepProcessor } from "./types";
import { cleanText } from "./cleanText";
import { summarize } from "./summarize";
import { extractKeyPoints } from "./extractKeyPoints";
import { tagCategory } from "./tagCategory";

export const processorRegistry: Record<string, StepProcessor> = {
  clean_text: cleanText,
  summarize: summarize,
  extract_key_points: extractKeyPoints,
  tag_category: tagCategory,
};

export interface PipelineStep {
  type: string;
  order: number;
  config?: Record<string, unknown>;
}

export interface PipelineStepOutput {
  stepOrder: number;
  stepType: string;
  input: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

export async function runPipeline(
  steps: PipelineStep[],
  initialInput: string
): Promise<PipelineStepOutput[]> {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const outputs: PipelineStepOutput[] = [];
  let currentInput = initialInput;

  for (const step of sortedSteps) {
    const processor = processorRegistry[step.type];
    if (!processor) {
      throw new Error(`Unknown step type: ${step.type}`);
    }

    const startTime = Date.now();
    const result = await processor(currentInput, step.config);
    const durationMs = Date.now() - startTime;

    outputs.push({
      stepOrder: step.order,
      stepType: step.type,
      input: currentInput,
      output: result.output,
      usedLlm: result.usedLlm,
      durationMs,
    });

    currentInput = result.output;
  }

  return outputs;
}
