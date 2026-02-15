"use client";

import { StepCard } from "./StepCard";
import { Button } from "@/components/ui/Button";
import { MIN_STEPS, MAX_STEPS } from "@/lib/constants";

interface Step {
  type: string;
}

interface StepListProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export function StepList({ steps, onChange }: StepListProps) {
  const addStep = () => {
    if (steps.length < MAX_STEPS) {
      onChange([...steps, { type: "clean_text" }]);
    }
  };

  const removeStep = (index: number) => {
    if (steps.length > MIN_STEPS) {
      onChange(steps.filter((_, i) => i !== index));
    }
  };

  const updateStepType = (index: number, type: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], type };
    onChange(updated);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Steps ({steps.length}/{MAX_STEPS})
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={addStep}
          disabled={steps.length >= MAX_STEPS}
        >
          + Add Step
        </Button>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            index={index}
            type={step.type}
            totalSteps={steps.length}
            onTypeChange={(type) => updateStepType(index, type)}
            onMoveUp={() => moveStep(index, "up")}
            onMoveDown={() => moveStep(index, "down")}
            onRemove={() => removeStep(index)}
            canRemove={steps.length > MIN_STEPS}
          />
        ))}
      </div>
    </div>
  );
}
