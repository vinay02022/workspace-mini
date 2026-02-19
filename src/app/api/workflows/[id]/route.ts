import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MIN_STEPS, MAX_STEPS, STEP_TYPES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { appCache } from "@/lib/cache";

const log = logger.child("API:Workflows");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  log.info("Fetching workflow by ID", { method: "GET", workflowId: id });

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  if (!workflow) {
    log.warn("Workflow not found", { workflowId: id });
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  log.info("Workflow fetched", { workflowId: id, name: workflow.name });
  return NextResponse.json(workflow);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  log.info("Updating workflow", { method: "PUT", workflowId: id });

  try {
    const body = await request.json();
    const { name, description, steps } = body;

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      log.warn("Workflow not found for update", { workflowId: id });
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      log.warn("Workflow update failed: empty name", { workflowId: id });
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length < MIN_STEPS || steps.length > MAX_STEPS) {
        log.warn("Workflow update failed: invalid step count", {
          workflowId: id,
          providedSteps: Array.isArray(steps) ? steps.length : 0,
        });
        return NextResponse.json(
          { error: `Workflow must have ${MIN_STEPS}-${MAX_STEPS} steps` },
          { status: 400 }
        );
      }

      const validTypes = STEP_TYPES.map((t) => t.value);
      for (const step of steps) {
        if (!validTypes.includes(step.type)) {
          log.warn("Workflow update failed: invalid step type", { workflowId: id, type: step.type });
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

    log.info("Workflow updated successfully", {
      workflowId: workflow.id,
      name: workflow.name,
      stepCount: workflow.steps.length,
    });

    // Invalidate workflows cache
    appCache.invalidateByPrefix("workflows:");

    return NextResponse.json(workflow);
  } catch (e) {
    log.error("Failed to update workflow", {
      workflowId: id,
      error: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
    });
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
  log.info("Deleting workflow", { method: "DELETE", workflowId: id });

  try {
    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      log.warn("Workflow not found for deletion", { workflowId: id });
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await prisma.workflow.delete({ where: { id } });
    // Invalidate workflows cache
    appCache.invalidateByPrefix("workflows:");
    log.info("Workflow deleted successfully", { workflowId: id, name: existing.name });
    return NextResponse.json({ success: true });
  } catch (e) {
    log.error("Failed to delete workflow", {
      workflowId: id,
      error: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
    });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete workflow" },
      { status: 500 }
    );
  }
}

