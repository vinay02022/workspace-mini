import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RUNS_LIMIT } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || String(DEFAULT_RUNS_LIMIT), 10);

  const runs = await prisma.run.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      workflow: true,
      stepOutputs: { orderBy: { stepOrder: "asc" } },
    },
  });

  return NextResponse.json(runs);
}
