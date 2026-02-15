"use client";

import { useState, useEffect } from "react";
import { RunCard } from "@/components/history/RunCard";

interface StepOutput {
  id: string;
  stepOrder: number;
  stepType: string;
  input: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

interface Run {
  id: string;
  input: string;
  status: string;
  error?: string | null;
  createdAt: string;
  workflow: { name: string };
  stepOutputs: StepOutput[];
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs?limit=5")
      .then((res) => res.json())
      .then((data) => setRuns(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Run History</h1>
        <p className="text-gray-600">
          View your last 5 workflow runs. Click to expand details.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : runs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-1">No runs yet</p>
          <p className="text-sm">Run a workflow to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard
              key={run.id}
              id={run.id}
              input={run.input}
              status={run.status}
              error={run.error}
              createdAt={run.createdAt}
              workflowName={run.workflow.name}
              stepOutputs={run.stepOutputs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
