import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { STEP_TYPES } from "@/lib/constants";

interface StepOutputCardProps {
  stepOrder: number;
  stepType: string;
  output: string;
  usedLlm: boolean;
  durationMs: number;
}

export function StepOutputCard({
  stepOrder,
  stepType,
  output,
  usedLlm,
  durationMs,
}: StepOutputCardProps) {
  const stepLabel = STEP_TYPES.find((s) => s.value === stepType)?.label || stepType;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
              {stepOrder}
            </span>
            <span className="font-medium text-sm text-gray-900">{stepLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={usedLlm ? "purple" : "gray"}>
              {usedLlm ? "LLM" : "Heuristic"}
            </Badge>
            <span className="text-xs text-gray-500">{durationMs}ms</span>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-48 overflow-y-auto">
          {output}
        </pre>
      </CardBody>
    </Card>
  );
}
