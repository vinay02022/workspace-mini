import { StepOutputCard } from "./StepOutputCard";

interface StepOutput {
  id: string;
  stepOrder: number;
  stepType: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

interface OutputPanelProps {
  stepOutputs: StepOutput[];
}

export function OutputPanel({ stepOutputs }: OutputPanelProps) {
  if (stepOutputs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Run a workflow to see step-by-step outputs here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Step Outputs</h3>
      {stepOutputs.map((output) => (
        <StepOutputCard
          key={output.id}
          stepOrder={output.stepOrder}
          stepType={output.stepType}
          output={output.output}
          usedLlm={output.usedLlm}
          durationMs={output.durationMs}
        />
      ))}
    </div>
  );
}
