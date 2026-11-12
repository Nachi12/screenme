# Privacy & Security Design

## Data Minimization & Lifecycle
1. **No Mandatory Raw File Retention**: Uploaded PDF/DOCX buffers are parsed in memory (never written permanently to disk unless explicitly enabled, and temp buffers are discarded immediately after extraction).
2. **Explicit Save Control**: Authenticated users choose whether to save extracted resume text/metadata for future comparison; guest analyses are automatically expired via MongoDB TTL (`GUEST_REPORT_TTL_HOURS`, default 24h).
3. **User-Controlled Deletion**: `DELETE /api/v1/reports/:id` permanently removes the report, associated roadmap progress, and orphaned resume/JD records owned by that user.

## Access Control & Authentication
- Passwords hashed with `bcryptjs` (cost factor 12).
- Sessions managed via signed JWTs stored in `HttpOnly`, `SameSite=Lax` cookies (`Secure=true` in production).
- Every report, status, export, roadmap, and delete endpoint enforces strict `userId` ownership (or signed guest token ownership for unauthenticated sessions).

## Input, File & Network Hardening
- **Upload Validation**: Extension + MIME + magic-byte signature verification (`%PDF-` for PDF; `PK\x03\x04` ZIP header + `word/document.xml` for DOCX), 5 MB default max size.
- **SSRF Protection on JD URL Import**: Only `https://` URLs from explicitly allowlisted public job-board hosts or safe public DNS IPs (blocking localhost, loopback, link-local, and private RFC1918 ranges) with strict timeout and byte cap.
- **Log Redaction**: Application logs record request IDs, latencies, and error codes—never raw resume text, emails, or API keys.
- **AI Processing Disclosure**: The UI explicitly informs users before upload that extracted text is processed by Google Gemini API to generate the evaluation and does not claim false compliance certifications.

