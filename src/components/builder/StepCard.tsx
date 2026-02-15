"use client";

import { STEP_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface StepCardProps {
  index: number;
  type: string;
  totalSteps: number;
  onTypeChange: (type: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function StepCard({
  index,
  type,
  totalSteps,
  onTypeChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canRemove,
}: StepCardProps) {
  const stepInfo = STEP_TYPES.find((s) => s.value === type);

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === totalSteps - 1}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-bold shrink-0">
        {index + 1}
      </div>

      <div className="flex-1">
        <Select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          options={STEP_TYPES.map((s) => ({ value: s.value, label: s.label }))}
        />
        {stepInfo && (
          <p className="mt-1 text-xs text-gray-500">{stepInfo.description}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
        title="Remove step"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  );
}
