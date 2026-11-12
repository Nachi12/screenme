import { Link } from 'react-router-dom';
import { FileCheck2, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="no-print border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#A3E635]/40 bg-[#A3E635]/15 text-[var(--accent-primary)]">
                <FileCheck2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">ScreenMe</span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-[var(--text-muted)]">
              Know your chances. Improve your resume. Get interview-ready. Built for
              students, freshers, interns, and early-career engineers seeking honest,
              evidence-based feedback.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-secondary)]" />
              <span>
                Uploaded files are parsed in memory; AI analysis uses Google Gemini
                under server-side controls.
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Platform
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link to="/analyze" className="hover:text-[var(--text-primary)]">
                  Analyze Resume
                </Link>
              </li>
              <li>
                <Link to="/sample-report" className="hover:text-[var(--text-primary)]">
                  Demonstration Report
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--text-primary)]">
                  Report History
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[var(--text-primary)]">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Trust & Transparency
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link to="/privacy" className="hover:text-[var(--text-primary)]">
                  Privacy & Data Protection
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-[var(--text-primary)]">
                  Scoring Methodology
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-[var(--text-primary)]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ScreenMe. Built for transparent resume intelligence.</p>
          <p className="font-mono text-[11px]">
            Deterministic ATS + Evidence-Weighted Matching
          </p>
        </div>
      </div>
    </footer>
  );
}

