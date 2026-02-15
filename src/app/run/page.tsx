"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { InputPanel } from "@/components/run/InputPanel";
import { OutputPanel } from "@/components/run/OutputPanel";

interface Workflow {
  id: string;
  name: string;
  steps: { id: string; type: string; order: number }[];
}

interface StepOutput {
  id: string;
  stepOrder: number;
  stepType: string;
  input: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

export default function RunPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [inputText, setInputText] = useState("");
  const [stepOutputs, setStepOutputs] = useState<StepOutput[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data);
        if (data.length > 0) {
          setSelectedWorkflowId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!selectedWorkflowId || !inputText.trim()) return;
    setRunning(true);
    setError(null);
    setStepOutputs([]);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: selectedWorkflowId, input: inputText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Run failed");
      }

      setStepOutputs(data.stepOutputs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run workflow");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Run Workflow</h1>
        <p className="text-gray-600">
          Select a workflow, paste your text, and run the pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              {workflows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No workflows available. Create one in the Builder first.
                </p>
              ) : (
                <>
                  <Select
                    label="Select Workflow"
                    value={selectedWorkflowId}
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    options={workflows.map((w) => ({
                      value: w.id,
                      label: `${w.name} (${w.steps.length} steps)`,
                    }))}
                  />
                  <InputPanel value={inputText} onChange={setInputText} />
                  <Button
                    onClick={handleRun}
                    disabled={running || !inputText.trim() || !selectedWorkflowId}
                    size="lg"
                    className="w-full"
                  >
                    {running ? "Running..." : "Run Pipeline"}
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Output Side */}
        <div>
          <OutputPanel stepOutputs={stepOutputs} />
        </div>
      </div>
    </div>
  );
}
