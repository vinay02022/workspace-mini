import { Card, CardBody } from "@/components/ui/Card";

interface StatusIndicatorProps {
  label: string;
  status: "ok" | "error" | "unavailable";
  message?: string;
}

export function StatusIndicator({ label, status, message }: StatusIndicatorProps) {
  const dotColors = {
    ok: "bg-green-500",
    error: "bg-red-500",
    unavailable: "bg-yellow-500",
  };

  const statusLabels = {
    ok: "Healthy",
    error: "Error",
    unavailable: "Unavailable",
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${dotColors[status]} shrink-0`} />
          <div>
            <h3 className="font-medium text-sm text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500">
              {message || statusLabels[status]}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
