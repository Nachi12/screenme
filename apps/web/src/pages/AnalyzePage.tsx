import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import {
  MAX_RESUME_FILE_SIZE_BYTES,
  type AnalysisJobStatusResponse,
  type ExperienceLevel,
  type HiringEnvironment,
} from '@screenme/shared';
import {
  Badge,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
} from '../components/ui/Primitives';
import { useAuth } from '../context/AuthContext';
import {
  api,
  ApiClientError,
  type UploadedResumeSummary,
} from '../services/apiClient';

const SAMPLE_JD_TEXT = `Job Title: Junior Full-Stack Software Engineer
Company: PayFlow Systems
Location: Bengaluru / Pune (Hybrid)

Qualifications & Eligibility:
- 2025/2026 B.Tech / B.E. graduates in Computer Science or IT.
- 0–1 year experience or strong academic/internship project portfolio.

Must-Have Technical Requirements:
- Hands-on experience building UIs with React and TypeScript.
- Build and maintain Node.js / Express REST APIs with proper validation and error handling.
- Proficiency in PostgreSQL queries and relational schema design.
- Implement secure authentication and role-based access control for API endpoints.
- Write unit and integration tests for critical backend routes and UI workflows.
- Comfortable with Git workflows and collaborative code reviews.

Preferred Skills:
- Exposure to Docker and AWS deployment is preferred.`;

export function AnalyzePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resume upload state
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedResume, setUploadedResume] =
    useState<UploadedResumeSummary | null>(null);

  // JD state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [importingUrl, setImportingUrl] = useState(false);
  const [urlNotice, setUrlNotice] = useState<string | null>(null);
  const [jdText, setJdText] = useState('');

  // Candidate profile state
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>('fresher');
  const [hiringEnvironment, setHiringEnvironment] =
    useState<HiringEnvironment>('auto_detect');
  const [targetRole, setTargetRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [saveResume, setSaveResume] = useState(false);

  // Analysis job state
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] =
    useState<AnalysisJobStatusResponse | null>(null);

  const handleFileSelected = async (file: File): Promise<void> => {
    setUploadError(null);
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
      setUploadError(
        'Unsupported file type. Please select a PDF (.pdf) or Word (.docx) resume.'
      );
      return;
    }
    if (file.size === 0) {
      setUploadError('The selected file is empty.');
      return;
    }
    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setUploadError('Resume file exceeds the 5 MB size limit.');
      return;
    }

    setUploading(true);
    setUploadProgress(30);
    const progressTimer = window.setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 15 : p));
    }, 180);

    try {
      const result = await api.uploadResume(file);
      setUploadProgress(100);
      setUploadedResume(result);
    } catch (err) {
      setUploadedResume(null);
      setUploadError(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to extract resume content. Please try another file.'
      );
    } finally {
      window.clearInterval(progressTimer);
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileSelected(file);
  };

  const handleImportUrl = async (): Promise<void> => {
    if (!jdUrl.trim()) return;
    setImportingUrl(true);
    setUrlNotice(null);
    try {
      const res = await api.parseJD({
        url: jdUrl.trim(),
        title: jobTitle || undefined,
        company: companyName || undefined,
      });
      if (res.imported && res.parsed) {
        setJdText(res.parsed.rawText);
        if (!jobTitle && res.parsed.title) setJobTitle(res.parsed.title);
        if (!companyName && res.parsed.company) setCompanyName(res.parsed.company);
        setUrlNotice('Job description imported. Review the extracted text below.');
      } else {
        setUrlNotice(
          res.fallbackReason ??
            'Automatic import unavailable for this URL. Please paste the job description text manually.'
        );
      }
    } catch (err) {
      setUrlNotice(
        err instanceof ApiClientError
          ? err.message
          : 'Could not import URL. Please paste the JD manually.'
      );
    } finally {
      setImportingUrl(false);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);

    if (!uploadedResume) {
      setSubmitError('Please upload a valid PDF or DOCX resume first.');
      return;
    }
    if (jdText.trim().length < 50) {
      setSubmitError(
        'Please paste a job description of at least 50 characters.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createAnalysis({
        resumeId: uploadedResume.resumeId,
        jobDescription: {
          title: jobTitle.trim() || undefined,
          company: companyName.trim() || undefined,
          rawText: jdText.trim(),
        },
        candidateProfile: {
          experienceLevel,
          hiringEnvironment,
          targetRole: targetRole.trim() || jobTitle.trim() || undefined,
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
        },
        saveResume: Boolean(user && saveResume),
      });

      setAnalysisId(res.analysisId);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(
        err instanceof ApiClientError
          ? err.message
          : 'Unable to start analysis. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;

    const poll = async (): Promise<void> => {
      try {
        const status = await api.getAnalysisStatus(analysisId);
        if (cancelled) return;
        setJobStatus(status);

        if (status.status === 'completed' && status.reportId) {
          setSubmitting(false);
          navigate(`/reports/${status.reportId}`);
          return;
        }
        if (status.status === 'failed') {
          setSubmitting(false);
          return;
        }
        window.setTimeout(() => {
          if (!cancelled) void poll();
        }, 1200);
      } catch (err) {
        if (cancelled) return;
        setSubmitting(false);
        setSubmitError(
          err instanceof ApiClientError
            ? err.message
            : 'Lost connection while polling analysis status.'
        );
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [analysisId, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)]">
            Analysis Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Analyze Your Resume Against a Job Description
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Upload your PDF/DOCX resume and paste the target JD for deterministic ATS checks, evidence matching, and HR evaluation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setJobTitle('Junior Full-Stack Software Engineer');
            setCompanyName('PayFlow Systems');
            setJdText(SAMPLE_JD_TEXT);
          }}
          className="self-start rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Fill Sample JD Text
        </button>
      </div>

      {/* Live Progress / Failure Banner */}
      {jobStatus && (
        <SurfaceCard className="mb-8 p-6" elevated>
          {jobStatus.status === 'failed' ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-critical)]" />
                <div>
                  <h2 className="text-base font-semibold text-[var(--status-critical)]">
                    Analysis Could Not Complete ({jobStatus.error?.code ?? 'ERROR'})
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {jobStatus.error?.message ??
                      'An upstream error occurred. ScreenMe never displays fabricated scores when evaluation fails.'}
                  </p>
                </div>
              </div>
              <SecondaryButton
                type="button"
                onClick={() => {
                  setAnalysisId(null);
                  setJobStatus(null);
                }}
              >
                <RefreshCw className="h-4 w-4" /> Dismiss & Retry
              </SecondaryButton>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-primary)]" />
                  <span className="text-sm font-semibold">
                    Running ScreenMe Analysis Pipeline...
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--accent-primary)]">
                  {jobStatus.progressPercent}%
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
                <div
                  className="h-full bg-[var(--accent-primary-bg)] transition-all duration-300"
                  style={{ width: `${jobStatus.progressPercent}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {jobStatus.stages.map((st) => (
                  <div
                    key={st.key}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  >
                    {st.status === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--status-success)]" />
                    ) : st.status === 'running' ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--accent-primary)]" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--border-subtle)]" />
                    )}
                    <span
                      className={
                        st.status === 'pending'
                          ? 'text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SurfaceCard>
      )}

      <form onSubmit={handleRunAnalysis}>
        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: RESUME UPLOAD */}
          <div className="space-y-6 lg:col-span-5">
            <SurfaceCard className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">1. Upload Resume</h2>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  PDF / DOCX · Max 5 MB
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                aria-label="Upload resume file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileSelected(file);
                }}
              />

              {!uploadedResume ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    dragging
                      ? 'border-[var(--accent-primary)] bg-[#A3E635]/5'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <UploadCloud className="h-8 w-8 text-[var(--accent-secondary)]" />
                  <p className="mt-3 text-sm font-medium">
                    Drag & drop your resume here, or{' '}
                    <span className="text-[var(--accent-primary)] underline">
                      browse files
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Text-selectable PDF or DOCX recommended. Image-only scanned PDFs are rejected.
                  </p>

                  {uploading && (
                    <div className="mt-4 w-full max-w-xs">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
                        <div
                          className="h-full bg-[var(--accent-primary-bg)] transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                        Validating & extracting text... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-primary)]" />
                      <div>
                        <p className="text-sm font-medium break-all">
                          {uploadedResume.fileName}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                          {uploadedResume.fileType.toUpperCase()} ·{' '}
                          {Math.round(uploadedResume.fileSizeBytes / 1024)} KB ·{' '}
                          {uploadedResume.pageCount} page(s) ·{' '}
                          {uploadedResume.wordCount} words
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-xs hover:bg-[var(--bg-surface)]"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        aria-label="Remove uploaded resume"
                        onClick={() => {
                          setUploadedResume(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="rounded-md border border-[var(--border-subtle)] p-1.5 text-[var(--status-critical)] hover:bg-[var(--bg-surface)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      Detected Sections ({uploadedResume.detectedSections.length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {uploadedResume.detectedSections.map((sec) => (
                        <Badge key={sec} tone="teal">
                          {sec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {uploadedResume.detectedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Extracted Skills ({uploadedResume.detectedSkills.length})
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {uploadedResume.detectedSkills.slice(0, 14).map((sk) => (
                          <Badge key={sk}>{sk}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedResume.extractionWarnings.length > 0 && (
                    <div className="rounded-lg border border-[#FBBF24]/40 bg-[#FBBF24]/10 p-3 text-xs text-[var(--status-warning)]">
                      <p className="font-semibold">Extraction Notes:</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {uploadedResume.extractionWarnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-xs text-[var(--status-critical)]"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </SurfaceCard>

            {/* Candidate Profile Settings */}
            <SurfaceCard className="p-6">
              <h2 className="text-base font-semibold">3. Candidate Profile</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="experience-level"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Experience Level *
                  </label>
                  <select
                    id="experience-level"
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(e.target.value as ExperienceLevel)
                    }
                    className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    <option value="student">Student</option>
                    <option value="fresher">Fresher (0 yrs)</option>
                    <option value="0_1_year">0–1 Year</option>
                    <option value="1_3_years">1–3 Years</option>
                    <option value="3_plus_years">3+ Years</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hiring-env"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Hiring Environment
                  </label>
                  <select
                    id="hiring-env"
                    value={hiringEnvironment}
                    onChange={(e) =>
                      setHiringEnvironment(e.target.value as HiringEnvironment)
                    }
                    className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    <option value="auto_detect">Auto-detect from JD</option>
                    <option value="it_services">IT Services Company</option>
                    <option value="product_based">Product-Based Company</option>
                    <option value="startup">Startup</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="target-role"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Target Role (optional)
                  </label>
                  <input
                    id="target-role"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Junior Full-Stack Developer"
                    className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="github-url"
                      className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                      GitHub URL (optional)
                    </label>
                    <input
                      id="github-url"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portfolio-url"
                      className="block text-xs font-medium text-[var(--text-muted)]"
                    >
                      Portfolio URL (optional)
                    </label>
                    <input
                      id="portfolio-url"
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  External GitHub/portfolio URLs are never fetched automatically without your explicit action.
                </p>

                {user && (
                  <label className="flex items-center gap-2 pt-1 text-xs text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={saveResume}
                      onChange={(e) => setSaveResume(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border-subtle)]"
                    />
                    Save extracted resume text to my account for future comparisons
                  </label>
                )}
              </div>
            </SurfaceCard>
          </div>

          {/* RIGHT COLUMN: JOB DESCRIPTION */}
          <div className="space-y-6 lg:col-span-7">
            <SurfaceCard className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">2. Target Job Description</h2>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {jdText.length.toLocaleString()} / 25,000 chars
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="job-title"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Job Title
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Junior Full-Stack Engineer"
                    className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company-name"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. PayFlow Systems"
                    className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Optional URL Importer */}
              <div className="mt-4">
                <label
                  htmlFor="jd-url"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Optional Supported Job URL (Greenhouse, Lever, Ashby, Internshala, Wellfound)
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      id="jd-url"
                      type="url"
                      value={jdUrl}
                      onChange={(e) => setJdUrl(e.target.value)}
                      placeholder="https://boards.greenhouse.io/..."
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] py-2 pr-3 pl-9 text-sm"
                    />
                  </div>
                  <SecondaryButton
                    type="button"
                    disabled={importingUrl || !jdUrl.trim()}
                    onClick={handleImportUrl}
                  >
                    {importingUrl ? 'Importing...' : 'Import JD'}
                  </SecondaryButton>
                </div>
                {urlNotice && (
                  <p className="mt-1.5 text-xs text-[var(--status-warning)]">
                    {urlNotice}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="jd-textarea"
                    className="block text-xs font-medium text-[var(--text-muted)]"
                  >
                    Job Description Text *
                  </label>
                  {jdText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setJdText('')}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  id="jd-textarea"
                  rows={14}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description including responsibilities, required skills, and preferred qualifications..."
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3 text-sm leading-relaxed"
                />
              </div>

              <div className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-3 text-xs text-[var(--text-muted)]">
                Privacy notice: Extracted resume text and JD text are sent to Google Gemini on our backend solely to generate your analysis. No raw PDF/DOCX binary is kept permanently.
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-xs text-[var(--status-critical)]"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-[var(--text-muted)]">
                  {uploadedResume
                    ? `Ready: ${uploadedResume.fileName}`
                    : 'Upload a resume on the left to enable analysis.'}
                </p>
                <PrimaryButton
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run ScreenMe Analysis'
                  )}
                </PrimaryButton>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </form>
    </div>
  );
}

