# ScreenMe REST API Contract (`/api/v1`)

All responses use a consistent envelope:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "code": "STRING_CODE", "message": "Human readable message", "details": ... } }`

## Authentication (`/api/v1/auth`)
- `POST /register` — `{ name, email, password }` -> sets HTTP-only cookie, returns user profile
- `POST /login` — `{ email, password }` -> sets HTTP-only cookie, returns user profile
- `POST /logout` — clears cookie
- `GET /me` — returns current authenticated user (or `401`)
- `POST /forgot-password` — `{ email }` -> issues time-limited reset token (returns dev token only in `NODE_ENV=test/development` logs/response for local testing, never in production)
- `POST /reset-password` — `{ token, newPassword }`

## Resumes & Job Descriptions
- `POST /resumes/upload` — `multipart/form-data` (`file`) -> validates PDF/DOCX, extracts text & structured sections, returns `{ resumeId, fileName, fileSize, pageCount, detectedSections, extractionWarnings, textPreview, contentHash }` (never persists raw binary)
- `POST /job-descriptions/parse` — `{ title?, company?, rawText?, url? }` -> supports direct text or allowlisted URL import; returns normalized JD preview

## Analyses & Reports
- `POST /analyses` — `{ resumeId, jobDescription: { title?, company?, rawText }, candidateProfile: { experienceLevel, hiringEnvironment, targetRole?, githubUrl?, portfolioUrl? }, saveResume?: boolean }` -> creates/deduplicates analysis job, returns `202 Accepted` with `{ analysisId, status }`
- `GET /analyses/:id/status` — returns `{ analysisId, status, currentStage, progressPercent, stages, error? }`
- `GET /analyses/:id` — alias/fetch full report when completed
- `GET /reports` — authenticated user's reports with query params `search`, `role`, `sort` (`newest` | `oldest` | `match_desc`), `page`, `limit`
- `GET /reports/sample` — public Demonstration Report (no auth required)
- `GET /reports/:id` — full structured report (ownership verified)
- `DELETE /reports/:id` — deletes report & linked roadmap progress (ownership verified)
- `GET /reports/:id/export` — generates and streams a formatted PDF report (`application/pdf`)
- `PATCH /roadmaps/:id/progress` — `{ taskId, completed }` -> persists interactive roadmap task state

