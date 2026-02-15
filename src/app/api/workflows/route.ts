import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MIN_STEPS, MAX_STEPS, STEP_TYPES } from "@/lib/constants";

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, steps } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!Array.isArray(steps) || steps.length < MIN_STEPS || steps.length > MAX_STEPS) {
      return NextResponse.json(
        { error: `Workflow must have ${MIN_STEPS}-${MAX_STEPS} steps` },
        { status: 400 }
      );
    }

    const validTypes = STEP_TYPES.map((t) => t.value);
    for (const step of steps) {
      if (!validTypes.includes(step.type)) {
        return NextResponse.json(
          { error: `Invalid step type: ${step.type}` },
          { status: 400 }
        );
      }
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        steps: {
          create: steps.map((step: { type: string; config?: string }, index: number) => ({
            type: step.type,
            order: index + 1,
            config: step.config || "{}",
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create workflow" },
      { status: 500 }
    );
  }
}
