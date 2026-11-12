# ScreenMe — AI Resume Screening, ATS Analysis & HR Evaluation Platform

> *"Know your chances. Improve your resume. Get interview-ready."*

ScreenMe is an evidence-based resume intelligence platform built for students, freshers, interns, and early-career software engineers (0–3 years). Unlike generic keyword checkers, ScreenMe separates deterministic **ATS Compatibility** checks from weighted **Job Match** scoring and an independent **AI HR Screening Verdict**, backed by verifiable resume-to-JD evidence, non-hallucinated resume rewrites, a 2–4 week improvement roadmap, and role-specific interview preparation.

## Monorepo Structure

```text
screenme/
  apps/
    web/        # React + TypeScript + Vite + Tailwind + Recharts + Framer Motion
    api/        # Node.js + Express + TypeScript + Mongoose + Google Gemini SDK
  packages/
    shared/     # Zod schemas, canonical skill taxonomy, scoring constants, shared types
  docs/         # Architecture, scoring methodology, AI prompt design, privacy, API contract, testing
```

## Quick Start

1. Copy `.env.example` to `.env` in the root (and/or `apps/api/.env`) and configure:
   - `MONGODB_URI` (local MongoDB or Atlas; for tests, `mongodb-memory-server` is used automatically)
   - `JWT_SECRET` (32+ char random string)
   - `GEMINI_API_KEY` (Google Gemini API key — server-side only)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build shared package and run development servers:
   ```bash
   npm run build --workspace=@screenme/shared
   npm run dev
   ```
4. Run all tests and typechecks:
   ```bash
   npm run typecheck
   npm test
   ```

## Documentation
- [Architecture](docs/architecture.md)
- [Scoring Methodology](docs/scoring-methodology.md)
- [AI Prompt Design](docs/ai-prompt-design.md)
- [Privacy & Security Design](docs/privacy-design.md)
- [API Contract](docs/api-contract.md)
- [Testing Plan](docs/testing-plan.md)

