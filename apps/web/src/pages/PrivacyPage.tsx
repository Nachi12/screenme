import { ShieldCheck } from 'lucide-react';
import { SurfaceCard } from '../components/ui/Primitives';

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[var(--accent-secondary)]" />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Privacy & AI Data Processing Notice
        </h1>
      </div>

      <div className="mt-8 space-y-5">
        <SurfaceCard className="p-6">
          <h2 className="text-base font-semibold">1. Temporary In-Memory File Parsing</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Uploaded PDF and DOCX resumes are validated and extracted in server memory. ScreenMe does not retain raw uploaded resume binary files permanently on disk.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="text-base font-semibold">2. Google Gemini AI Processing</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Extracted resume text and job description text are transmitted securely from ScreenMe&apos;s backend to the Google Gemini API to generate evidence classification, HR screening feedback, bullet rewrites, roadmaps, and interview questions. ScreenMe never exposes API keys to the browser and never sends resume contents to third-party analytics platforms.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="text-base font-semibold">3. Retention & User-Controlled Deletion</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Guest reports expire automatically after the configured TTL window (default 24 hours). Authenticated users control their own saved reports and can permanently delete any report, roadmap progress, and associated parsed records from the Dashboard.
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}

