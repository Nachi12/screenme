import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  GitBranch,
  GraduationCap,
  Layers,
  Lock,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import { SAMPLE_DEMONSTRATION_REPORT } from '@screenme/shared';
import { Badge, SurfaceCard } from '../components/ui/Primitives';

const INTERACTIVE_SAMPLE_ITEMS = SAMPLE_DEMONSTRATION_REPORT.jobMatch.requirements.slice(0, 4);

const FAQ_ITEMS = [
  {
    q: 'Does ScreenMe replicate a specific company ATS like Workday or Greenhouse?',
    a: 'No. No external tool has access to an employer’s proprietary ATS rules. ScreenMe evaluates compatibility using documented structural, extractability, contact, and terminology checks—and clearly discloses what cannot be determined from extracted text.',
  },
  {
    q: 'Will ScreenMe penalize me if I am a fresher with no full-time work experience?',
    a: 'No. When you select Student, Fresher, or Internship, ScreenMe activates Fresher Mode and evaluates academic projects, personal builds, hackathons, internships, and coursework as valid practical evidence.',
  },
  {
    q: 'Does the AI rewrite my resume by inventing fake numbers or skills?',
    a: 'Never. Before-and-after rewrites only use facts present in your resume. Whenever metrics or implementation details are missing, ScreenMe highlights them as Claims Requiring Verification so you confirm real facts before copying.',
  },
  {
    q: 'How is my resume data handled and protected?',
    a: 'Uploaded PDF and DOCX files are parsed in memory and never stored as permanent binary files on disk. Unauthenticated guest analyses expire automatically, and authenticated users can delete any saved report permanently at any time.',
  },
  {
    q: 'Is my Job Match score a hiring probability?',
    a: 'No. Job Match estimates how strongly your documented evidence aligns with the job description’s weighted requirements. Actual hiring depends on applicant pools, interview performance, and internal team needs.',
  },
];

export function LandingPage() {
  const [selectedReqId, setSelectedReqId] = useState(
    INTERACTIVE_SAMPLE_ITEMS[0]?.requirementId ?? ''
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedReq =
    INTERACTIVE_SAMPLE_ITEMS.find((r) => r.requirementId === selectedReqId) ??
    INTERACTIVE_SAMPLE_ITEMS[0];

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* HERO */}
      <section
        id="product"
        className="border-b border-[var(--border-subtle)] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-6"
            >
              <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--accent-secondary)]">
                AI-POWERED RESUME INTELLIGENCE
              </span>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.1]">
                Your Resume Deserves More Than an ATS Score.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                Discover how your resume matches a job, what recruiters might notice,
                and exactly what to improve before applying.
              </p>

              <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
                Know your chances. Improve your resume. Get interview-ready.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary-bg)] px-5 py-3 text-sm font-semibold text-[var(--accent-primary-ink)] transition-opacity hover:opacity-90"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/sample-report"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
                >
                  Explore Sample Report
                </Link>
              </div>
            </motion.div>

            {/* Realistic Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-6"
            >
              <SurfaceCard className="p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                      Demonstration Preview
                    </p>
                    <p className="text-sm font-semibold">
                      Junior Full-Stack Engineer · Sample JD
                    </p>
                  </div>
                  <Badge tone="teal">Fresher Mode</Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">Job Match</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[var(--accent-primary)]">
                      68<span className="text-xs text-[var(--text-muted)]">/100</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">ATS Compatibility</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[var(--status-success)]">
                      86<span className="text-xs text-[var(--text-muted)]">/100</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">HR Screening</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--status-warning)]">
                      Potential Match
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Critical Skill Gaps</span>
                      <span className="font-mono text-[var(--status-critical)]">2 Must-Have</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Authentication (JWT/Sessions) · Automated API Testing
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">4-Week Improvement Roadmap</span>
                      <span className="font-mono text-[var(--accent-secondary)]">Week 1–4</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Week 1: REST validation → Week 2: HTTP-only auth → Week 3: Supertest suite
                    </p>
                  </div>
                </div>
              </SurfaceCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 1. HOW SCREENME WORKS */}
      <section id="how-it-works" className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)]">
              01 · Workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              How ScreenMe Works
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              A transparent, multi-stage pipeline separating deterministic checks from explainable AI evaluation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Upload PDF or DOCX',
                desc: 'We extract text, headings, contact fields, and project sections in memory without keeping raw files.',
              },
              {
                step: '02',
                title: 'Parse JD Requirements',
                desc: 'Requirements are classified into Must-Have, Preferred, and Contextual—so preferred skills never unfairly fail you.',
              },
              {
                step: '03',
                title: 'Verify Evidence & ATS',
                desc: 'Deterministic ATS checks run first; every JD skill is checked against real project and work evidence.',
              },
              {
                step: '04',
                title: 'Act on Your Roadmap',
                desc: 'Review honest bullet rewrites, a 2–4 week upskilling plan, and interview questions tailored to your projects.',
              },
            ].map((item) => (
              <SurfaceCard key={item.step} className="p-5">
                <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  STEP {item.step}
                </span>
                <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.desc}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ATS CHECK VS HR SCREENING */}
      <section id="features" className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)]">
              02 · Dual Evaluation
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ATS Compatibility vs. HR Screening
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Passing automated parsing does not guarantee a human recruiter shortlist. ScreenMe evaluates both separately.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-[var(--accent-secondary)]" />
                <h3 className="text-lg font-semibold">Deterministic ATS Compatibility</h3>
              </div>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                100% rule-based checks producing consistent scores for identical documents. Checks what is verifiable and marks unobservable layout traits as “Not evaluated”.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Extractable UTF-8 text & image-only PDF detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Standard section headings & chronology markers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Contact & clickable profile link extraction
                </li>
              </ul>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-[var(--accent-primary)]" />
                <h3 className="text-lg font-semibold">AI HR Screening Evaluation</h3>
              </div>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Simulates a thoughtful Indian and global technical recruiter reviewing readability, project credibility, practical depth, and role alignment.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Evidence-backed verdict: Strong / Potential / Needs Improvement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Distinguishes skills listed vs. skills proven in projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  Zero demographic assumptions or fake pass/fail claims
                </li>
              </ul>
            </SurfaceCard>
          </div>
        </div>
      </section>

      {/* 3, 4, 5 FEATURE PILLARS */}
      <section className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <SurfaceCard className="p-6">
              <Target className="h-5 w-5 text-[var(--status-warning)]" />
              <h3 className="mt-3 text-lg font-semibold">Understand Your Skill Gaps</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Requirements are grouped into Critical Gaps, Important Gaps, Optional Improvements, and Visibility Gaps—with conditional advice instead of blind keyword stuffing.
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
              <h3 className="mt-3 text-lg font-semibold">Improve With Evidence</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Side-by-side bullet rewrites sharpen clarity while flagging every unverified claim or placeholder metric for you to confirm first.
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <GraduationCap className="h-5 w-5 text-[var(--accent-secondary)]" />
              <h3 className="mt-3 text-lg font-semibold">Built for Freshers & Early-Career</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Academic builds, personal apps, hackathons, and internships are evaluated fairly so students aren’t penalized for lacking 3 years of employment.
              </p>
            </SurfaceCard>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE SAMPLE ANALYSIS */}
      <section className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)]">
                Interactive Evidence Explorer
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Click Any Requirement to Inspect the Evidence
              </h2>
            </div>
            <Link
              to="/sample-report"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-primary)] hover:underline"
            >
              Open Full Demonstration Report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="space-y-2.5 lg:col-span-5">
              {INTERACTIVE_SAMPLE_ITEMS.map((item) => {
                const active = item.requirementId === selectedReq?.requirementId;
                return (
                  <button
                    key={item.requirementId}
                    type="button"
                    onClick={() => setSelectedReqId(item.requirementId)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-2)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{item.requirement}</span>
                      <Badge
                        tone={
                          item.status === 'explicitly_demonstrated'
                            ? 'success'
                            : item.status === 'partially_demonstrated'
                              ? 'warning'
                              : 'critical'
                        }
                      >
                        {item.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedReq && (
              <SurfaceCard className="p-6 lg:col-span-7" elevated>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
                  <h3 className="text-base font-semibold">{selectedReq.requirement}</h3>
                  <Badge tone="neutral">{selectedReq.importance.replace('_', ' ')}</Badge>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-[var(--text-muted)]">
                      JD Source Excerpt
                    </p>
                    <p className="mt-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs leading-relaxed">
                      “{selectedReq.jdSourceSnippet}”
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase text-[var(--text-muted)]">
                      Resume Evidence ({selectedReq.resumeSection ?? 'Not Found'})
                    </p>
                    <p className="mt-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs leading-relaxed">
                      {selectedReq.resumeEvidenceSnippet
                        ? `“${selectedReq.resumeEvidenceSnippet}”`
                        : 'No supporting evidence extracted in the resume.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-[var(--text-primary)]">Why: </span>
                    <span className="text-[var(--text-muted)]">{selectedReq.explanation}</span>
                  </p>
                  <p>
                    <span className="font-medium text-[var(--accent-secondary)]">
                      Suggested Action:{' '}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {selectedReq.suggestedAction}
                    </span>
                  </p>
                </div>
              </SurfaceCard>
            )}
          </div>
        </div>
      </section>

      {/* 7. PRIVACY & DATA PROTECTION */}
      <section className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SurfaceCard className="p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--accent-secondary)]">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight">
                  Privacy and Data Protection
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Resumes contain personal information. ScreenMe minimizes retention and makes AI processing explicit.
                </p>
                <Link
                  to="/privacy"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-primary)] hover:underline"
                >
                  Read Privacy Notice <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {[
                  {
                    icon: Layers,
                    title: 'In-Memory File Parsing',
                    body: 'Uploaded PDFs and DOCX files are extracted in memory and never stored permanently as raw files on disk.',
                  },
                  {
                    icon: GitBranch,
                    title: 'Prompt Injection Isolation',
                    body: 'Resume and JD text are treated as untrusted data, isolated from system instructions, and validated against strict schemas.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4"
                  >
                    <item.icon className="h-4 w-4 text-[var(--accent-secondary)]" />
                    <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="border-b border-[var(--border-subtle)] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <SurfaceCard key={item.q} className="overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm font-medium hover:bg-[var(--bg-surface-2)]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--border-subtle)] px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {item.a}
                    </div>
                  )}
                </SurfaceCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to See What Your Resume Really Communicates?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--text-muted)]">
            Upload your PDF or DOCX resume, paste a target job description, and get an evidence-backed review in under a minute.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary-bg)] px-6 py-3 text-sm font-semibold text-[var(--accent-primary-ink)] hover:opacity-90"
            >
              Analyze My Resume <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sample-report"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-3 text-sm font-medium hover:bg-[var(--bg-surface-2)]"
            >
              Explore Sample Report
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

