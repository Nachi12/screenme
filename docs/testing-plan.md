# ScreenMe Testing Plan

## Test Pyramid
1. **Unit Tests (`apps/api/src/tests/unit/`)**:
   - `skillNormalizer.test.ts`: Canonical aliases (`React.js -> React`, `Postgres -> PostgreSQL`) and anti-confusion boundaries (`Java !== JavaScript`, `React !== React Native`, `Git !== GitHub`, `MongoDB !== SQL`).
   - `atsAnalyzer.test.ts`: Deterministic 0–100 scoring, section detection, contact visibility, `not_evaluated` handling, identical inputs -> identical score.
   - `scoring.test.ts`: Weight normalization, evidence multipliers, fresher mode handling, zero LLM arbitrary score overrides.
   - `resumeParser.test.ts`: Valid PDF, valid DOCX, empty file, unsupported file, corrupted PDF, image-only PDF detection.

2. **Integration & Security Tests (`apps/api/src/tests/integration/`)**:
   - `auth.test.ts`: Registration, duplicate email rejection, login, cookie auth, password reset, protected route rejection.
   - `analysisPipeline.test.ts`: Full vertical flow with mocked AI provider boundary (verifies real parsing, JD parsing, ATS, scoring, persistence, status polling, PDF export, and deletion).
   - `negativeCases.test.ts`:
     - Unsupported file extension / spoofed MIME magic bytes
     - Empty file & corrupted PDF
     - Image-only PDF (no extractable text)
     - Missing JD / overly short JD
     - Invalid malformed AI JSON output -> clean failure (no fake scores)
     - AI provider timeout -> retry + clean error state
     - Unauthorized access to another user's report (`403`/`404`)
     - Duplicate concurrent analysis request deduplication
     - Report deletion & subsequent `404` verification
   - `scoringRegression.test.ts`: Fixed resume + JD fixtures asserting deterministic ATS and Job Match scores within exact expected values.

3. **Frontend Verification (`apps/web`)**:
   - `tsc --noEmit` strict type check
   - `vite build` production bundle verification
   - Interactive UI verification across desktop (1440px), tablet (768px), and mobile (375px) viewports.

