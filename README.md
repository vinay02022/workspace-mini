# Workflow Builder Lite

A production-ready, full-stack workflow engine that lets users design multi-step text-processing pipelines, execute them in real time, and track every run with detailed per-step observability. Built with a modern React/Next.js stack and backed by an LLM-powered processing layer with intelligent heuristic fallbacks.

> **Live demo flow:** Create a pipeline in `/builder` &rarr; Run it on any text in `/run` &rarr; Inspect per-step outputs &rarr; Browse history in `/history`

---

## Key Highlights

- **Visual Pipeline Builder** &mdash; Drag-and-drop-style step management (add, remove, reorder) with real-time validation (2-4 steps enforced)
- **Dual-Mode Processing** &mdash; Each LLM step has a hand-tuned heuristic fallback, so the app is fully functional with or without an API key
- **Per-Step Observability** &mdash; Every run records input/output per step, execution time, and whether LLM or heuristic was used
- **Production Architecture** &mdash; Standalone Docker builds, Prisma ORM with migrations, singleton DB clients, proper error boundaries
- **Type-Safe End to End** &mdash; TypeScript across frontend, backend, API contracts, and database layer (Prisma-generated types)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite via Prisma ORM (zero-config, file-based) |
| **LLM** | Google Gemini 2.0 Flash (optional) |
| **Testing** | Jest + ts-jest (unit + integration) |
| **Infra** | Docker multi-stage build, Docker Compose |

---

## Architecture

```
Client (React)  -->  Next.js API Routes  -->  Processor Pipeline  -->  Gemini / Heuristic
                           |
                     Prisma ORM  -->  SQLite
```

**Processor Registry Pattern** &mdash; Each step type implements a `StepProcessor` interface. A central registry maps type strings to processor functions. The pipeline runner chains them sequentially, feeding each step's output as the next step's input.

**LLM Guard Pattern** &mdash; `isLlmAvailable()` checks the env before any API call. Every LLM processor wraps calls in try/catch and falls back to heuristics on failure. Zero crashes from missing keys or API outages.

---

## Step Types

| Step | What It Does | LLM Mode | Heuristic Fallback |
|------|-------------|----------|-------------------|
| **Clean Text** | Normalize whitespace, trim lines, collapse blanks | Pure heuristic | N/A |
| **Summarize** | Condense text to 2-3 key sentences | Gemini 2.0 Flash | First 3 sentences extraction |
| **Extract Key Points** | Pull structured bullet points | Gemini 2.0 Flash | Top-5 longest substantive sentences |
| **Tag Category** | Auto-categorize with topic tags | Gemini 2.0 Flash | Keyword frequency scoring across 7 domains |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with feature overview |
| `/builder` | Create and manage workflows (2-4 step pipelines) |
| `/run` | Select workflow, paste text, execute, view step-by-step results |
| `/history` | Browse last 5 runs with expandable details |
| `/status` | Live health dashboard (Backend, DB, LLM) with 30s auto-refresh |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Quick Start

```bash
# Clone and install
git clone https://github.com/vinay02022/workspace-mini.git
cd workspace-mini
npm install

# Setup environment
cp .env.example .env

# Initialize database
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Enable LLM Features (Optional)

Add your Google Gemini API key to `.env`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Without a key, all LLM steps gracefully fall back to heuristic processing. The `/status` page shows LLM availability in real time.

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/status` | Health check (backend, database, LLM) |
| `GET` | `/api/workflows` | List all workflows with steps |
| `POST` | `/api/workflows` | Create workflow (validates 2-4 steps) |
| `GET` | `/api/workflows/[id]` | Get single workflow |
| `PUT` | `/api/workflows/[id]` | Update workflow |
| `DELETE` | `/api/workflows/[id]` | Delete workflow (cascades) |
| `POST` | `/api/run` | Execute pipeline on input text |
| `GET` | `/api/runs?limit=N` | Fetch recent runs with step outputs |

---

## Testing

```bash
npm test
```

**41 tests across 7 suites:**
- `cleanText` processor &mdash; 7 tests covering trimming, normalization, edge cases
- `summarize` processor &mdash; 5 tests covering sentence splitting, edge cases
- `extractKeyPoints` processor &mdash; 5 tests covering bullet extraction, filtering, limits
- `tagCategory` processor &mdash; 7 tests covering all category domains, multi-tag, fallback
- Pipeline Runner &mdash; 6 integration tests covering chaining, ordering, timing, error handling
- Workflows API &mdash; 7 tests covering validation, creation, and input limits
- Status API &mdash; 4 tests covering health check responses and LLM state

---

## Docker

```bash
# Build and run
docker compose up --build

# With Gemini API key
GEMINI_API_KEY=your-key docker compose up --build
```

Multi-stage Dockerfile (deps &rarr; build &rarr; runner) produces a minimal Alpine-based production image.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages + API routes
│   ├── api/              # 6 REST API endpoints
│   ├── builder/          # Workflow creation page
│   ├── run/              # Pipeline execution page
│   ├── history/          # Run history page
│   └── status/           # System health dashboard
├── components/           # React components
│   ├── ui/               # Reusable primitives (Button, Card, Badge, Select, TextArea)
│   ├── layout/           # Navbar (sticky, active states), Footer
│   ├── builder/          # StepCard, StepList, WorkflowForm
│   ├── run/              # InputPanel, OutputPanel, StepOutputCard
│   ├── history/          # RunCard (expandable)
│   └── status/           # StatusIndicator (green/red/amber)
├── lib/                  # Prisma singleton, Gemini client, constants
├── processors/           # 4 step processors + registry + pipeline runner
└── __tests__/            # Jest test suites
```

---

## Database Schema

4 models with cascading relationships:

- **Workflow** &rarr; has many **Steps** (ordered, typed)
- **Workflow** &rarr; has many **Runs**
- **Run** &rarr; has many **StepOutputs** (per-step input, output, timing, LLM flag)
