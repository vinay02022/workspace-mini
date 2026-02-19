import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MIN_STEPS, MAX_STEPS, STEP_TYPES, MAX_WORKFLOW_NAME_LENGTH, MAX_WORKFLOW_DESCRIPTION_LENGTH } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { appCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

const log = logger.child("API:Workflows");

export async function GET() {
  log.info("Fetching all workflows", { method: "GET", path: "/api/workflows" });

  // Check cache first
  const cached = appCache.get<unknown[]>(CACHE_KEYS.WORKFLOWS_LIST);
  if (cached) {
    log.info("Workflows fetched from cache", { count: cached.length });
    return NextResponse.json(cached);
  }

  const workflows = await prisma.workflow.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  // Cache the result
  appCache.set(CACHE_KEYS.WORKFLOWS_LIST, workflows, CACHE_TTL.WORKFLOWS_LIST);
  log.info("Workflows fetched from database", { count: workflows.length });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  log.info("Creating new workflow", { method: "POST", path: "/api/workflows" });
  try {
    const body = await request.json();
    const { name, description, steps } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      log.warn("Workflow creation failed: missing name");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (name.trim().length > MAX_WORKFLOW_NAME_LENGTH) {
      log.warn("Workflow creation failed: name too long", { length: name.trim().length });
      return NextResponse.json(
        { error: `Name must be ${MAX_WORKFLOW_NAME_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    if (description && typeof description === "string" && description.trim().length > MAX_WORKFLOW_DESCRIPTION_LENGTH) {
      log.warn("Workflow creation failed: description too long", { length: description.trim().length });
      return NextResponse.json(
        { error: `Description must be ${MAX_WORKFLOW_DESCRIPTION_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    if (!Array.isArray(steps) || steps.length < MIN_STEPS || steps.length > MAX_STEPS) {
      log.warn("Workflow creation failed: invalid step count", {
        providedSteps: Array.isArray(steps) ? steps.length : 0,
        min: MIN_STEPS,
        max: MAX_STEPS,
      });
      return NextResponse.json(
        { error: `Workflow must have ${MIN_STEPS}-${MAX_STEPS} steps` },
        { status: 400 }
      );
    }

    const validTypes = STEP_TYPES.map((t) => t.value);
    for (const step of steps) {
      if (!validTypes.includes(step.type)) {
        log.warn("Workflow creation failed: invalid step type", { type: step.type });
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

    log.info("Workflow created successfully", {
      workflowId: workflow.id,
      name: workflow.name,
      stepCount: workflow.steps.length,
    });

    // Invalidate workflows cache since a new one was created
    appCache.invalidateByPrefix("workflows:");

    return NextResponse.json(workflow, { status: 201 });
  } catch (e) {
    log.error("Failed to create workflow", {
      error: e instanceof Error ? e.message : "Unknown error",
      stack: e instanceof Error ? e.stack : undefined,
    });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create workflow" },
      { status: 500 }
    );
  }
}
