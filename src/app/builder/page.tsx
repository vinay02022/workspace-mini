"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkflowForm } from "@/components/builder/WorkflowForm";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { STEP_TYPES } from "@/lib/constants";

interface Step {
  id: string;
  type: string;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  createdAt: string;
}

export default function BuilderPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
      }
    } catch {
      // Handle silently
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Builder</h1>
        <p className="text-gray-600">
          Create a new workflow by defining 2-4 processing steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Workflow
          </h2>
          <WorkflowForm onSaved={fetchWorkflows} />
        </div>

        {/* Existing Workflows */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Existing Workflows
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : workflows.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500 text-center py-4">
                  No workflows yet. Create your first one!
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">
                          {workflow.name}
                        </h3>
                        {workflow.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {workflow.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {workflow.steps.map((step, i) => (
                        <Badge key={step.id} variant="blue">
                          {i + 1}. {STEP_TYPES.find((s) => s.value === step.type)?.label || step.type}
                        </Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
