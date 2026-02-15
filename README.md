# Workflow Builder Lite

A full-stack web application for creating and running text-processing workflows. Build pipelines of 2-4 steps, execute them on any text, and view detailed per-step outputs with run history.

## Features

- **Workflow Builder** - Create workflows with 2-4 configurable processing steps
- **Pipeline Runner** - Execute workflows on input text with real-time step-by-step output
- **Run History** - Browse recent runs with expandable step details
- **System Status** - Health monitoring for backend, database, and LLM availability
- **LLM + Heuristic Fallback** - Uses OpenAI when available, gracefully falls back to heuristic processing

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **LLM**: OpenAI SDK (optional)
- **Testing**: Jest + ts-jest
- **Containerization**: Docker + Docker Compose

## Step Types

| Step | Description | LLM Mode | Fallback Mode |
|------|-------------|-----------|---------------|
| Clean Text | Trim, normalize whitespace, collapse blank lines | N/A (pure heuristic) | N/A |
| Summarize | GPT-powered text summarization | OpenAI GPT-3.5 | First 3 sentences |
| Extract Key Points | Extract bullet points from text | OpenAI GPT-3.5 | Longest substantive sentences |
| Tag Category | Categorize text with relevant tags | OpenAI GPT-3.5 | Keyword-based scoring |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd workspace-mini

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Optional: Enable LLM Features

Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=sk-your-key-here
```

Without an API key, all LLM-powered steps fall back to heuristic processing.

## Docker

```bash
# Build and run
docker compose up --build

# With OpenAI key
OPENAI_API_KEY=sk-your-key docker compose up --build
```

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages + API routes
│   ├── api/              # REST API endpoints
│   ├── builder/          # Workflow creation page
│   ├── run/              # Pipeline execution page
│   ├── history/          # Run history page
│   └── status/           # System health page
├── components/           # React components
│   ├── ui/               # Reusable primitives (Button, Card, Badge, etc.)
│   ├── layout/           # Navbar, Footer
│   ├── builder/          # Workflow form components
│   ├── run/              # Input/output panels
│   ├── history/          # Run cards
│   └── status/           # Health indicators
├── lib/                  # Shared utilities (Prisma, OpenAI, constants)
├── processors/           # Step processor implementations + pipeline runner
└── __tests__/            # Jest test suites
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/status` | System health check |
| GET | `/api/workflows` | List all workflows |
| POST | `/api/workflows` | Create a workflow |
| GET | `/api/workflows/[id]` | Get a single workflow |
| PUT | `/api/workflows/[id]` | Update a workflow |
| DELETE | `/api/workflows/[id]` | Delete a workflow |
| POST | `/api/run` | Execute a workflow pipeline |
| GET | `/api/runs` | Get recent run history |
