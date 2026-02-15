"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusIndicator } from "@/components/status/StatusIndicator";

interface StatusData {
  backend: { status: "ok" | "error" };
  database: { status: "ok" | "error"; error?: string };
  llm: { status: "ok" | "unavailable"; message: string };
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setLastChecked(new Date());
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-gray-600">
          Health checks for all system components. Auto-refreshes every 30 seconds.
        </p>
        {lastChecked && (
          <p className="text-xs text-gray-400 mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Checking status...</p>
      ) : !status ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Unable to reach the backend. Please check if the server is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusIndicator
            label="Backend"
            status={status.backend.status}
            message="Server is running"
          />
          <StatusIndicator
            label="Database"
            status={status.database.status}
            message={
              status.database.status === "ok"
                ? "SQLite connected"
                : status.database.error
            }
          />
          <StatusIndicator
            label="LLM (Gemini)"
            status={status.llm.status}
            message={status.llm.message}
          />
        </div>
      )}
    </div>
  );
}
