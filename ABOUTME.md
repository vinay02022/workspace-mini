# ABOUT ME

## Vinay Pandey

Full Stack Engineer with strong frontend focus (React, TypeScript, Next.js) and growing backend experience (Node.js, Prisma, REST APIs, databases).

I enjoy building product-focused systems that solve real problems. I have experience working in startup environments where I owned features end-to-end — from UI to backend logic, deployment, and performance optimization.

Currently working as a Full Stack Engineer at Crio.Do.

---

## Experience Summary

- Built scalable frontend applications using React and Redux.
- Improved engagement by ~23% in a dashboard application by redesigning UI and optimizing data flow.
- Worked on real-time features reducing latency and improving UX.
- Implemented authentication systems and secure backend APIs.
- Experience integrating LLM workflows and AI-powered features.
- Comfortable with CI/CD, Docker, and cloud deployment (AWS basics).

---

## Tech Stack

**Frontend**
- React
- Next.js
- TypeScript
- TailwindCSS

**Backend**
- Node.js
- Express / Next Route Handlers
- Prisma ORM
- REST APIs

**Database**
- PostgreSQL
- SQLite

**Other**
- Git / GitHub
- Docker
- Basic AWS
- AI API integrations (OpenAI)

---

## Why I Like Building Systems

I enjoy building systems that are clean, understandable, and scalable. I prefer clarity over complexity and believe good engineering is about balancing speed and correctness.

---

## Contact

Email: [your email here]
GitHub: [your GitHub link]
LinkedIn: [your LinkedIn link]

---

## Project: Workflow Builder Lite

This project was built as a demonstration of full-stack development skills, showcasing the ability to architect and implement a complete web application from scratch.

### Design Decisions

#### Architecture
- **Next.js App Router** was chosen for its unified frontend/backend approach, simplifying deployment and reducing boilerplate
- **SQLite + Prisma** provides zero-config persistent storage with type-safe database access
- **Processor Registry Pattern** makes it easy to add new step types without modifying existing code

#### LLM Integration
- The application is fully functional without an OpenAI API key
- Every LLM-powered processor has a heuristic fallback that produces reasonable results
- The `isLlmAvailable()` guard prevents unnecessary API calls when no key is configured
- All LLM calls are wrapped in try/catch to gracefully degrade on errors

#### UI/UX
- Mobile-first responsive design with Tailwind CSS
- Blue primary palette with Inter font for a clean, professional look
- Card-based layout with subtle shadows and borders for visual hierarchy
- Active link highlighting in the navbar for clear navigation context

#### Testing Strategy
- Unit tests for pure processor logic (cleanText)
- Integration tests for API routes (status endpoint)
- Mocking of external dependencies (Prisma, OpenAI) for isolated testing
