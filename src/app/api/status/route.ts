import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isLlmAvailable } from "@/lib/gemini";
import { logger } from "@/lib/logger";

const log = logger.child("API:Status");

export async function GET() {
  log.info("Health check requested", { method: "GET", path: "/api/status" });

  // Check backend
  const backend = { status: "ok" as const };

  // Check database
  let database: { status: "ok" | "error"; error?: string };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { status: "ok" };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    log.error("Database health check failed", { error: errorMsg });
    database = { status: "error", error: errorMsg };
  }

  // Check LLM
  const llmAvailable = isLlmAvailable();
  const llm = {
    status: llmAvailable ? ("ok" as const) : ("unavailable" as const),
    message: llmAvailable
      ? "Gemini API key configured"
      : "No API key set - using heuristic fallbacks",
  };

  log.info("Health check completed", {
    backend: backend.status,
    database: database.status,
    llm: llm.status,
  });

  return NextResponse.json({ backend, database, llm });
}

