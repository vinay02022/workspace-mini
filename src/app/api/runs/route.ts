import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RUNS_LIMIT } from "@/lib/constants";
import { logger } from "@/lib/logger";

const log = logger.child("API:Runs");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = Math.min(
    Math.max(parseInt(rawLimit || String(DEFAULT_RUNS_LIMIT), 10) || DEFAULT_RUNS_LIMIT, 1),
    50
  );

  log.info("Fetching recent runs", { method: "GET", path: "/api/runs", limit });

  const runs = await prisma.run.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      workflow: true,
      stepOutputs: { orderBy: { stepOrder: "asc" } },
    },
  });

  log.info("Runs fetched", { count: runs.length, limit });

  return NextResponse.json(runs);
}

