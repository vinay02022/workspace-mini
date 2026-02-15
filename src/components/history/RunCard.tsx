"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StepOutputCard } from "@/components/run/StepOutputCard";

interface StepOutput {
  id: string;
  stepOrder: number;
  stepType: string;
  input: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

interface RunCardProps {
  id: string;
  input: string;
  status: string;
  error?: string | null;
  createdAt: string;
  workflowName: string;
  stepOutputs: StepOutput[];
}

export function RunCard({
  input,
  status,
  error,
  createdAt,
  workflowName,
  stepOutputs,
}: RunCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusVariant = {
    completed: "green" as const,
    failed: "red" as const,
    running: "yellow" as const,
    pending: "gray" as const,
  };

  return (
    <Card>
      <CardBody>
        <div
          className="cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">
                {workflowName}
              </span>
              <Badge variant={statusVariant[status as keyof typeof statusVariant] || "gray"}>
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleString()}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <p className="text-sm text-gray-600 truncate">{input}</p>

          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        {expanded && stepOutputs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
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
        )}
      </CardBody>
    </Card>
  );
}
