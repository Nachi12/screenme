# ScreenMe Architecture

## System Overview
ScreenMe is structured as an npm workspaces monorepo with three packages:

1. **`packages/shared` (`@screenme/shared`)**:
   - Canonical Zod validation schemas for API payloads, analysis outputs, and database documents.
   - Deterministic scoring constants, category weights, and version identifiers (`ANALYSIS_VERSION`, `SCORING_VERSION`, `PROMPT_VERSION`).
   - Skill normalization taxonomy and explicit anti-confusion rules (`Java !== JavaScript`, `React !== React Native`, `Git !== GitHub`, `MongoDB !== SQL`).

2. **`apps/api` (`@screenme/api`)**:
   - Node.js + Express + TypeScript backend.
   - MongoDB + Mongoose persistence with strict ownership checks and TTL expiration for guest analyses/temporary documents.
   - Modular 15-stage analysis pipeline:
     1. File Upload & Magic-Byte Validation (`multer` memory storage, 5 MB limit)
     2. Text Extraction (`resumeParser.service.ts` using `pdfjs-dist` + `mammoth`)
     3. Resume Structure Detection (sections, contact visibility, page/line offsets)
     4. Job Description Parsing (`jdParser.service.ts` — deterministic + AI requirement classification)
     5. Skill Normalization (`skillNormalizer.service.ts`)
     6. Requirement Classification (`must_have`, `preferred`, `contextual`, `unclear`)
     7. Deterministic ATS Compatibility Checks (`atsAnalyzer.service.ts`)
     8. Evidence-Based Job Matching (`jobMatcher.service.ts`)
     9. Fresher & Project Evaluation (`projectEvaluator.service.ts`)
     10. AI HR Screening Simulation (`hrEvaluator.service.ts`)
     11. Non-Hallucinated Resume Rewrites (`resumeRewrite.service.ts`)
     12. Personalized 2–4 Week Roadmap (`roadmapGenerator.service.ts`)
     13. Role-Specific Interview Prep (`interviewGenerator.service.ts`)
     14. Deterministic Score Calculation (`scoring.service.ts`)
     15. Structured Report Assembly & Validation (`reportAssembler.service.ts`)
   - Async job execution (`analysisJob.service.ts`) updating stage progress in MongoDB so the frontend can display live progress via `GET /api/v1/analyses/:id/status`.

3. **`apps/web` (`@screenme/web`)**:
   - React + TypeScript + Vite + Tailwind CSS + Recharts + Framer Motion + Lucide icons.
   - Routes:
     - `/` — Conversion-focused Landing Page
     - `/analyze` — Two-column Resume & JD Analysis Workspace
     - `/sample-report` — Unauthenticated Demonstration Report
     - `/reports/:reportId` — Interactive Results Dashboard + Print-Safe PDF Export
     - `/dashboard` — Authenticated Report History, Search, Filter & Same-JD Version Comparison
     - `/auth` — Sign In / Register / Password Reset
     - `/privacy` — Clear Privacy & AI Data Processing Disclosure

