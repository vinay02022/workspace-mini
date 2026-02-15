import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isLlmAvailable } from "@/lib/gemini";

export async function GET() {
  // Check backend
  const backend = { status: "ok" as const };

  // Check database
  let database: { status: "ok" | "error"; error?: string };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { status: "ok" };
  } catch (e) {
    database = { status: "error", error: e instanceof Error ? e.message : "Unknown error" };
  }

  // Check LLM
  const llm = {
    status: isLlmAvailable() ? ("ok" as const) : ("unavailable" as const),
    message: isLlmAvailable()
      ? "Gemini API key configured"
      : "No API key set - using heuristic fallbacks",
  };

  return NextResponse.json({ backend, database, llm });
}
