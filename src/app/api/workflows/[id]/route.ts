import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MIN_STEPS, MAX_STEPS, STEP_TYPES } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, description, steps } = body;

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (steps !== undefined) {
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

      // Delete existing steps and recreate
      await prisma.step.deleteMany({ where: { workflowId: id } });
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(steps !== undefined && {
          steps: {
            create: steps.map((step: { type: string; config?: string }, index: number) => ({
              type: step.type,
              order: index + 1,
              config: step.config || "{}",
            })),
          },
        }),
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(workflow);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update workflow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
