import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPipeline } from "@/processors";
import { MAX_INPUT_TEXT_LENGTH } from "@/lib/constants";
import { logger } from "@/lib/logger";

const log = logger.child("API:Run");

export async function POST(request: NextRequest) {
  const requestStart = Date.now();
  log.info("Pipeline execution requested", { method: "POST", path: "/api/run" });

  try {
    const body = await request.json();
    const { workflowId, input } = body;

    if (!workflowId || typeof workflowId !== "string") {
      log.warn("Missing or invalid workflowId", { workflowId });
      return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
    }

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      log.warn("Missing or empty input text", { workflowId });
      return NextResponse.json({ error: "Input text is required" }, { status: 400 });
    }

    if (input.length > MAX_INPUT_TEXT_LENGTH) {
      log.warn("Input text exceeds maximum length", {
        workflowId,
        inputLength: input.length,
        maxLength: MAX_INPUT_TEXT_LENGTH,
      });
      return NextResponse.json(
        { error: `Input text exceeds maximum length of ${MAX_INPUT_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    if (!workflow) {
      log.warn("Workflow not found", { workflowId });
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    log.info("Workflow loaded", {
      workflowId,
      workflowName: workflow.name,
      stepCount: workflow.steps.length,
      inputLength: input.trim().length,
    });

    // Create the run record
    const run = await prisma.run.create({
      data: {
        input: input.trim(),
        workflowId,
        status: "running",
      },
    });

    log.info("Run record created", { runId: run.id, workflowId });

    try {
      const pipelineSteps = workflow.steps.map((s) => ({
        type: s.type,
        order: s.order,
        config: JSON.parse(s.config),
      }));

      const pipelineStart = Date.now();
      const outputs = await runPipeline(pipelineSteps, input.trim());
      const pipelineDuration = Date.now() - pipelineStart;

      log.info("Pipeline execution completed", {
        runId: run.id,
        stepsExecuted: outputs.length,
        totalPipelineDurationMs: pipelineDuration,
        llmSteps: outputs.filter((o) => o.usedLlm).length,
        heuristicSteps: outputs.filter((o) => !o.usedLlm).length,
      });

      // Save step outputs
      for (const output of outputs) {
        await prisma.stepOutput.create({
          data: {
            runId: run.id,
            stepOrder: output.stepOrder,
            stepType: output.stepType,
            input: output.input,
            output: output.output,
            usedLlm: output.usedLlm,
            durationMs: output.durationMs,
          },
        });
      }

      // Mark run as completed
      const completedRun = await prisma.run.update({
        where: { id: run.id },
        data: { status: "completed" },
        include: {
          stepOutputs: { orderBy: { stepOrder: "asc" } },
          workflow: true,
        },
      });

      const totalDuration = Date.now() - requestStart;
      log.info("Run completed successfully", {
        runId: run.id,
        workflowId,
        totalRequestDurationMs: totalDuration,
      });

      return NextResponse.json(completedRun);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Pipeline execution failed";
      log.error("Pipeline execution failed", {
        runId: run.id,
        workflowId,
        error: errorMessage,
        stack: e instanceof Error ? e.stack : undefined,
      });

      // Mark run as failed
      await prisma.run.update({
        where: { id: run.id },
        data: {
          status: "failed",
          error: errorMessage,
        },
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to run workflow";
    log.error("Unexpected error in run endpoint", {
      error: errorMessage,
      stack: e instanceof Error ? e.stack : undefined,
      durationMs: Date.now() - requestStart,
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
