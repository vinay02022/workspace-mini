# Prompts Used

## Overview

This document captures the key prompts and instructions used to build the Workflow Builder Lite application with AI assistance.

## Primary Prompt

The project was built from a comprehensive implementation plan that specified:

1. **Tech Stack**: Next.js 14+ App Router, TypeScript, Tailwind CSS, Prisma + SQLite, OpenAI SDK, Jest, Docker
2. **Project Structure**: Complete file tree with all directories and files
3. **Database Schema**: 4 Prisma models (Workflow, Step, Run, StepOutput) with relationships
4. **API Routes**: 6 endpoints for workflows CRUD, pipeline execution, run history, and health status
5. **Processor Architecture**: 4 step types with LLM + heuristic dual-mode processing
6. **UI Pages**: 5 pages (Home, Builder, Run, History, Status) with responsive design
7. **Implementation Order**: 4-phase approach (Scaffolding, Backend, UI, Polish)

## Key Design Prompts

- "Build a full-stack Workflow Builder Lite web app from scratch"
- "LLM features gracefully fallback to heuristics when no API key is set"
- "Create text-processing workflows (2-4 steps), run them on input text, and view per-step outputs and run history"
- "Each processor implements: (input: string, config?) => Promise<{ output: string, usedLlm: boolean }>"
- "Pipeline runner executes steps sequentially, feeding each step's output as the next step's input"

## Implementation Approach

The implementation followed the 4-phase plan sequentially:
1. **Phase 1**: Project scaffolding with all dependencies and configuration
2. **Phase 2**: Backend processors and API routes
3. **Phase 3**: UI components and all 5 pages
4. **Phase 4**: Tests, Docker, and documentation
