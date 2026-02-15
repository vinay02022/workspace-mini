import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPipeline } from "@/processors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, input } = body;

    if (!workflowId || typeof workflowId !== "string") {
      return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
    }

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json({ error: "Input text is required" }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Create the run record
    const run = await prisma.run.create({
      data: {
        input: input.trim(),
        workflowId,
        status: "running",
      },
    });

    try {
      const pipelineSteps = workflow.steps.map((s) => ({
        type: s.type,
        order: s.order,
        config: JSON.parse(s.config),
      }));

      const outputs = await runPipeline(pipelineSteps, input.trim());

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

      return NextResponse.json(completedRun);
    } catch (e) {
      // Mark run as failed
      await prisma.run.update({
        where: { id: run.id },
        data: {
          status: "failed",
          error: e instanceof Error ? e.message : "Pipeline execution failed",
        },
      });

      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Pipeline execution failed" },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to run workflow" },
      { status: 500 }
    );
  }
}
