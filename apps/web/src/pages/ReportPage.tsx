import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  FileText,
  FolderGit2,
  HelpCircle,
  Info,
  Layers,
  ListChecks,
  MessageSquare,
  Printer,
  ShieldAlert,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  SAMPLE_DEMONSTRATION_REPORT,
  type AnalysisReport,
  type HRVerdict,
  type RequirementMatch,
} from '@screenme/shared';
import {
  Badge,
  SecondaryButton,
  SurfaceCard,
  scoreTone,
} from '../components/ui/Primitives';
import { api, ApiClientError } from '../services/apiClient';

type ReportTab =
  | 'overview'
  | 'ats'
  | 'hr'
  | 'skills'
  | 'projects'
  | 'rewrites'
  | 'roadmap'
  | 'interview';

const NAV_ITEMS: Array<{
  id: ReportTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'ats', label: 'ATS Compatibility', icon: FileText },
  { id: 'hr', label: 'HR Evaluation', icon: UserCheck },
  { id: 'skills', label: 'Skills Analysis', icon: ShieldAlert },
  { id: 'projects', label: 'Project Analysis', icon: FolderGit2 },
  { id: 'rewrites', label: 'Resume Improvements', icon: Sparkles },
  { id: 'roadmap', label: 'Improvement Roadmap', icon: ListChecks },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
];

function verdictTone(verdict: HRVerdict) {
  if (verdict === 'Strong Match') return 'success' as const;
  if (verdict === 'Potential Match') return 'warning' as const;
  if (verdict === 'Needs Improvement') return 'warning' as const;
  return 'critical' as const;
}

function statusBadgeTone(status: RequirementMatch['status']) {
  if (status === 'explicitly_demonstrated') return 'success' as const;
  if (status === 'partially_demonstrated') return 'warning' as const;
  if (status === 'mentioned_without_evidence') return 'teal' as const;
  if (status === 'not_found') return 'critical' as const;
  return 'neutral' as const;
}

export function ReportPage({ isSample = false }: { isSample?: boolean }) {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<AnalysisReport | null>(
    isSample ? SAMPLE_DEMONSTRATION_REPORT : null
  );
  const [loading, setLoading] = useState(!isSample);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [selectedReq, setSelectedReq] = useState<RequirementMatch | null>(null);

  // Rewrite interactive state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingRewriteId, setEditingRewriteId] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  // Interview prep interactive state
  const [questionFilter, setQuestionFilter] = useState<string>('all');
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const loadReport = async (): Promise<void> => {
    if (isSample) {
      setReport(SAMPLE_DEMONSTRATION_REPORT);
      setSelectedReq(SAMPLE_DEMONSTRATION_REPORT.jobMatch.requirements[0] ?? null);
      setLoading(false);
      return;
    }
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReport(reportId);
      setReport(res.report);
      setSelectedReq(res.report.jobMatch.requirements[0] ?? null);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Unable to load analysis report.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSample, reportId]);

  const evidenceDistribution = useMemo(() => {
    if (!report) return [];
    const counts = {
      explicitly_demonstrated: 0,
      partially_demonstrated: 0,
      mentioned_without_evidence: 0,
      not_found: 0,
    };
    for (const r of report.jobMatch.requirements) {
      if (r.status in counts) {
        counts[r.status as keyof typeof counts] += 1;
      }
    }
    return [
      { name: 'Demonstrated', count: counts.explicitly_demonstrated, color: '#4ADE80' },
      { name: 'Partial', count: counts.partially_demonstrated, color: '#FBBF24' },
      { name: 'Mentioned Only', count: counts.mentioned_without_evidence, color: '#2DD4BF' },
      { name: 'Not Found', count: counts.not_found, color: '#F87171' },
    ];
  }, [report]);

  const categoryChartData = useMemo(() => {
    if (!report) return [];
    return report.jobMatch.categoryBreakdown
      .filter((c) => c.score !== null)
      .map((c) => ({
        name: c.label
          .replace('Mandatory Technical Requirements', 'Mandatory Tech')
          .replace('Relevant Projects & Practical Experience', 'Projects & Exp')
          .replace('Core Responsibilities', 'Responsibilities')
          .replace('Education & Eligibility', 'Education')
          .replace('Preferred Skills', 'Preferred'),
        score: c.score ?? 0,
        weight: Math.round(c.normalizedWeight * 100),
      }));
  }, [report]);

  const handleToggleRoadmapTask = async (
    taskId: string,
    nextCompleted: boolean
  ): Promise<void> => {
    if (!report) return;
    setReport((prev) =>
      prev
        ? {
            ...prev,
            roadmap: {
              ...prev.roadmap,
              tasks: prev.roadmap.tasks.map((t) =>
                t.taskId === taskId ? { ...t, completed: nextCompleted } : t
              ),
            },
          }
        : prev
    );

    if (!report.isSample) {
      try {
        await api.updateRoadmapTask(report.id, {
          taskId,
          completed: nextCompleted,
        });
      } catch {
        // Revert on error
        setReport((prev) =>
          prev
            ? {
                ...prev,
                roadmap: {
                  ...prev.roadmap,
                  tasks: prev.roadmap.tasks.map((t) =>
                    t.taskId === taskId ? { ...t, completed: !nextCompleted } : t
                  ),
                },
              }
            : prev
        );
      }
    }
  };

  const handleCopyRewrite = async (id: string, text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-[var(--bg-surface-2)]" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
            <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
            <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <SurfaceCard className="p-8">
          <XCircle className="mx-auto h-10 w-10 text-[var(--status-critical)]" />
          <h1 className="mt-4 text-xl font-bold">Report Unavailable</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {error ?? 'This analysis report could not be found or has expired.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <SecondaryButton type="button" onClick={() => void loadReport()}>
              Retry
            </SecondaryButton>
            <Link
              to="/analyze"
              className="rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-primary-ink)]"
            >
              Run New Analysis
            </Link>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  const completedTasksCount = report.roadmap.tasks.filter((t) => t.completed).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Sample Banner */}
      {report.isSample && (
        <div className="no-print mb-6 flex flex-col justify-between gap-3 rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-sm">
            <Info className="h-4 w-4 shrink-0 text-[var(--accent-secondary)]" />
            <span>
              <strong className="font-semibold">Demonstration Report:</strong>{' '}
              Explore a realistic sample evaluation without uploading personal files.
            </span>
          </div>
          <Link
            to="/analyze"
            className="shrink-0 rounded-lg bg-[var(--accent-primary-bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-primary-ink)]"
          >
            Analyze My Resume
          </Link>
        </div>
      )}

      {/* Report Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link
              to={report.isSample ? '/' : '/dashboard'}
              className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {report.isSample ? 'Home' : 'Dashboard'}
            </Link>
            <span>/</span>
            <span className="font-mono">{report.analysisVersion}</span>
            <span>·</span>
            <span className="font-mono">{report.scoringVersion}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {report.jobTitle}{' '}
            <span className="font-normal text-[var(--text-muted)]">
              at {report.companyName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Candidate: <span className="text-[var(--text-primary)]">{report.candidateName}</span>{' '}
            · File: <span className="font-mono text-xs">{report.resumeSummary.fileName}</span>{' '}
            · Analyzed {new Date(report.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5">
          {report.jobMatch.fresherModeApplied && (
            <Badge tone="teal">Fresher Mode Active</Badge>
          )}
          <a
            href={api.getExportPdfUrl(report.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium hover:bg-[var(--bg-surface-2)]"
          >
            <Download className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
            Export PDF
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-medium hover:bg-[var(--bg-surface-2)]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Sidebar / Mobile Tabs */}
        <aside className="no-print min-w-0 lg:col-span-3">
          <nav
            aria-label="Report sections"
            className="flex gap-1.5 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? 'border-[var(--accent-primary)]/50 bg-[var(--bg-surface-2)] font-medium text-[var(--accent-primary)]'
                      : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 space-y-6 lg:col-span-9">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Three Separate Indicators */}
              <div className="grid gap-4 md:grid-cols-3">
                <SurfaceCard className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      Job Match Score
                    </span>
                    <Badge tone={scoreTone(report.jobMatch.score)}>
                      {report.jobMatch.confidence} confidence
                    </Badge>
                  </div>
                  <p className="mt-3 font-mono text-3xl font-bold">
                    {report.jobMatch.score !== null ? `${report.jobMatch.score}` : 'N/A'}
                    <span className="text-sm font-normal text-[var(--text-muted)]">
                      /100
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {report.jobMatch.disclaimer}
                  </p>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      ATS Compatibility
                    </span>
                    <Badge tone={scoreTone(report.atsEvaluation.score)}>
                      Deterministic
                    </Badge>
                  </div>
                  <p className="mt-3 font-mono text-3xl font-bold">
                    {report.atsEvaluation.score}
                    <span className="text-sm font-normal text-[var(--text-muted)]">
                      /100
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {report.atsEvaluation.passedCount} passed ·{' '}
                    {report.atsEvaluation.warningCount} warning ·{' '}
                    {report.atsEvaluation.failedCount} failed
                  </p>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      HR Screening Verdict
                    </span>
                    <Badge tone={verdictTone(report.hrEvaluation.verdict)}>
                      Recruiter View
                    </Badge>
                  </div>
                  <p className="mt-3 text-xl font-bold">
                    {report.hrEvaluation.verdict}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {report.hrEvaluation.reasoningSummary}
                  </p>
                </SurfaceCard>
              </div>

              {/* Summary & Top Improvements */}
              <SurfaceCard className="p-6">
                <h2 className="text-base font-semibold">Executive Summary</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {report.jobMatch.summary}
                </p>

                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--status-success)]">
                      Key Strengths
                    </h3>
                    <ul className="mt-2.5 space-y-2 text-sm text-[var(--text-muted)]">
                      {report.hrEvaluation.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-success)]" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--status-warning)]">
                      Top Recommended Improvements
                    </h3>
                    <ul className="mt-2.5 space-y-2 text-sm text-[var(--text-muted)]">
                      {report.topRecommendedImprovements.map((imp) => (
                        <li key={imp} className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-warning)]" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SurfaceCard>

              {/* Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <SurfaceCard className="p-5">
                  <h3 className="text-sm font-semibold">Category Score Breakdown</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Weighted deterministic category scores (0–100)
                  </p>
                  <div className="mt-4 h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryChartData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#28363A" />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fill: '#91A3A2', fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={105}
                          tick={{ fill: '#E7F5F0', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111A1F',
                            borderColor: '#28363A',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                          {categoryChartData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.score >= 75
                                  ? '#4ADE80'
                                  : entry.score >= 55
                                    ? '#A3E635'
                                    : '#FBBF24'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <h3 className="text-sm font-semibold">Requirement Evidence Coverage</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Count of JD requirements by verification status
                  </p>
                  <div className="mt-4 h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={evidenceDistribution}
                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#28363A" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#E7F5F0', fontSize: 11 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: '#91A3A2', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111A1F',
                            borderColor: '#28363A',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {evidenceDistribution.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SurfaceCard>
              </div>

              {/* Interactive Requirement Evidence Table + Inspector */}
              <SurfaceCard className="p-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-semibold">
                      Requirement-by-Requirement Evidence
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Click any row to inspect the exact JD source snippet and matching resume evidence.
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                        <th className="py-2.5 pr-4 font-medium">Requirement</th>
                        <th className="py-2.5 pr-4 font-medium">Importance</th>
                        <th className="py-2.5 pr-4 font-medium">Status</th>
                        <th className="py-2.5 font-medium">Resume Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {report.jobMatch.requirements.map((req) => {
                        const isSelected =
                          selectedReq?.requirementId === req.requirementId;
                        return (
                          <tr
                            key={req.requirementId}
                            onClick={() => setSelectedReq(req)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[var(--bg-surface-2)]'
                                : 'hover:bg-[var(--bg-surface-2)]/60'
                            }`}
                          >
                            <td className="py-3 pr-4 font-medium">{req.requirement}</td>
                            <td className="py-3 pr-4">
                              <Badge tone="neutral">
                                {req.importance.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge tone={statusBadgeTone(req.status)}>
                                {req.status.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 font-mono text-xs text-[var(--text-muted)]">
                              {req.resumeSection ?? '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedReq && (
                  <div className="mt-5 rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--bg-surface-2)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">
                        Evidence Inspector: {selectedReq.requirement}
                      </h3>
                      <Badge tone={statusBadgeTone(selectedReq.status)}>
                        {selectedReq.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                        <p className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
                          JD Text
                        </p>
                        <p className="mt-1 text-xs leading-relaxed">
                          {selectedReq.jdSourceSnippet}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                        <p className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
                          Resume Evidence ({selectedReq.resumeSection ?? 'None'})
                        </p>
                        <p className="mt-1 text-xs leading-relaxed">
                          {selectedReq.resumeEvidenceSnippet ??
                            'No matching resume snippet extracted.'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-primary)]">Explanation: </strong>
                      {selectedReq.explanation}
                    </p>
                    <p className="mt-1 text-xs text-[var(--accent-secondary)]">
                      <strong>Recommended Action: </strong>
                      {selectedReq.suggestedAction}
                    </p>
                  </div>
                )}
              </SurfaceCard>
            </>
          )}

          {/* ATS COMPATIBILITY */}
          {activeTab === 'ats' && (
            <SurfaceCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h2 className="text-lg font-bold">ATS Compatibility Evaluation</h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {report.atsEvaluation.disclaimer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-3xl font-bold text-[var(--accent-primary)]">
                    {report.atsEvaluation.score}/100
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {report.atsEvaluation.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {chk.status === 'passed' ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                        ) : chk.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-[var(--status-warning)]" />
                        ) : chk.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-[var(--status-critical)]" />
                        ) : (
                          <HelpCircle className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                        <span className="text-sm font-semibold">{chk.name}</span>
                      </div>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {chk.status === 'not_evaluated'
                          ? 'Not evaluated'
                          : `${chk.score}/${chk.maxScore} pts`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                      {chk.explanation}
                    </p>
                    {chk.recommendation && (
                      <p className="mt-1.5 text-xs text-[var(--accent-secondary)]">
                        Fix: {chk.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}

          {/* HR EVALUATION */}
          {activeTab === 'hr' && (
            <SurfaceCard className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h2 className="text-lg font-bold">HR Recruiter Screening Report</h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Job-evidence assessment only. Not a definitive prediction of selection or rejection.
                  </p>
                </div>
                <Badge tone={verdictTone(report.hrEvaluation.verdict)}>
                  {report.hrEvaluation.verdict}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Screening Impression</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {report.hrEvaluation.screeningImpression}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--status-success)]">
                    Strengths Observed
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-[var(--text-muted)]">
                    {report.hrEvaluation.strengths.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--status-critical)]">
                    Recruiter Concerns
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-[var(--text-muted)]">
                    {report.hrEvaluation.concerns.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/5 p-4">
                <h3 className="text-sm font-semibold text-[var(--accent-secondary)]">
                  Readiness Guidance
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  {report.hrEvaluation.readinessGuidance}
                </p>
              </div>
            </SurfaceCard>
          )}

          {/* SKILLS ANALYSIS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <SurfaceCard className="p-6">
                <h2 className="text-lg font-bold">Skill Evidence Classification</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                    <p className="text-xs font-semibold text-[var(--status-success)]">
                      Demonstrated ({report.skillAnalysis.demonstrated.length})
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {report.skillAnalysis.demonstrated.map((s) => (
                        <Badge key={s} tone="success">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                    <p className="text-xs font-semibold text-[var(--status-warning)]">
                      Partial Evidence ({report.skillAnalysis.partial.length})
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {report.skillAnalysis.partial.map((s) => (
                        <Badge key={s} tone="warning">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                    <p className="text-xs font-semibold text-[var(--accent-secondary)]">
                      Listed Without Proof ({report.skillAnalysis.mentionedOnly.length})
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {report.skillAnalysis.mentionedOnly.map((s) => (
                        <Badge key={s} tone="teal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-6">
                <h2 className="text-base font-semibold">Detailed Skill Gaps & Next Actions</h2>
                <div className="mt-4 space-y-3">
                  {report.skillAnalysis.missing.map((gap) => (
                    <div
                      key={`${gap.skill}-${gap.group}`}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{gap.skill}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            tone={
                              gap.group === 'critical_gaps'
                                ? 'critical'
                                : gap.group === 'important_gaps'
                                  ? 'warning'
                                  : 'teal'
                            }
                          >
                            {gap.group.replace(/_/g, ' ')}
                          </Badge>
                          <Badge tone="neutral">{gap.priority} priority</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        <strong className="text-[var(--text-primary)]">Why it matters: </strong>
                        {gap.whyItMatters}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        <strong className="text-[var(--text-primary)]">JD Evidence: </strong>
                        “{gap.jdEvidence}”
                      </p>
                      <p className="mt-1 text-xs text-[var(--accent-secondary)]">
                        <strong>Action: </strong>
                        {gap.suggestedNextAction}
                      </p>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </div>
          )}

          {/* PROJECT ANALYSIS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {report.projectAnalysis.length === 0 ? (
                <SurfaceCard className="p-6 text-sm text-[var(--text-muted)]">
                  No structured projects were detected in this resume. Adding 2–3 concrete academic or personal projects significantly helps early-career evaluations.
                </SurfaceCard>
              ) : (
                report.projectAnalysis.map((proj) => (
                  <SurfaceCard key={proj.projectName} className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-base font-bold">{proj.projectName}</h2>
                      <Badge
                        tone={
                          proj.relevanceToJD === 'high'
                            ? 'success'
                            : proj.relevanceToJD === 'medium'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {proj.relevanceToJD} JD relevance
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {proj.complexityAssessment}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {proj.technologiesDemonstrated.map((t) => (
                        <Badge key={t} tone="success">{t}</Badge>
                      ))}
                      {proj.technologiesMissingForJD.map((t) => (
                        <Badge key={t} tone="critical">Missing: {t}</Badge>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-[var(--status-success)]">
                          Demonstrated Strengths
                        </p>
                        <ul className="mt-1.5 space-y-1 text-xs text-[var(--text-muted)]">
                          {proj.strengths.map((s) => (
                            <li key={s}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--status-warning)]">
                          Gaps & Optional Enhancements
                        </p>
                        <ul className="mt-1.5 space-y-1 text-xs text-[var(--text-muted)]">
                          {proj.recommendedEnhancements.map((e) => (
                            <li key={e}>• {e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </SurfaceCard>
                ))
              )}
            </div>
          )}

          {/* RESUME REWRITER */}
          {activeTab === 'rewrites' && (
            <div className="space-y-5">
              <SurfaceCard className="p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  ScreenMe never invents metrics, users, or experience. Review every item listed under{' '}
                  <strong className="text-[var(--status-warning)]">
                    Claims Requiring Verification
                  </strong>{' '}
                  before placing any rewrite on your resume.
                </p>
              </SurfaceCard>

              {report.rewriteSuggestions.map((rw) => {
                const currentText = editedTexts[rw.id] ?? rw.suggestedRewrite;
                const isEditing = editingRewriteId === rw.id;

                return (
                  <SurfaceCard key={rw.id} className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--accent-secondary)]">
                        {rw.section}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rw.relevantJDSkills.map((sk) => (
                          <Badge key={sk}>{sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                          Original
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                          {rw.originalText}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#A3E635]/40 bg-[var(--bg-surface-2)] p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-primary)]">
                            Suggested Rewrite
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingRewriteId(isEditing ? null : rw.id)
                              }
                              className="inline-flex items-center gap-1 rounded border border-[var(--border-subtle)] px-2 py-1 text-[11px] hover:bg-[var(--bg-surface)]"
                            >
                              <Edit3 className="h-3 w-3" />
                              {isEditing ? 'Done' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCopyRewrite(rw.id, currentText)}
                              className="inline-flex items-center gap-1 rounded border border-[var(--border-subtle)] px-2 py-1 text-[11px] hover:bg-[var(--bg-surface)]"
                            >
                              {copiedId === rw.id ? (
                                <>
                                  <Check className="h-3 w-3 text-[var(--status-success)]" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {isEditing ? (
                          <textarea
                            rows={4}
                            value={currentText}
                            onChange={(e) =>
                              setEditedTexts((prev) => ({
                                ...prev,
                                [rw.id]: e.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 text-sm"
                          />
                        ) : (
                          <p className="mt-2 text-sm leading-relaxed">
                            {currentText}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-primary)]">Why it is better: </strong>
                      {rw.whyItIsBetter}
                    </p>

                    {rw.claimsRequiringVerification.length > 0 && (
                      <div className="mt-3 rounded-lg border border-[#FBBF24]/40 bg-[#FBBF24]/10 p-3 text-xs text-[var(--status-warning)]">
                        <p className="font-semibold">Claims Requiring Verification:</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4">
                          {rw.claimsRequiringVerification.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </SurfaceCard>
                );
              })}
            </div>
          )}

          {/* IMPROVEMENT ROADMAP */}
          {activeTab === 'roadmap' && (
            <SurfaceCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <h2 className="text-lg font-bold">
                    {report.roadmap.durationWeeks}-Week Improvement Roadmap
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {report.roadmap.disclaimer}
                  </p>
                </div>
                <Badge tone="accent">
                  {completedTasksCount} / {report.roadmap.tasks.length} Completed
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {report.roadmap.tasks.map((task) => (
                  <label
                    key={task.taskId}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                      task.completed
                        ? 'border-[#4ADE80]/40 bg-[#4ADE80]/5'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) =>
                        void handleToggleRoadmapTask(task.taskId, e.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded accent-[#A3E635]"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                            WEEK {task.week}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              task.completed ? 'line-through opacity-70' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone="teal">{task.skill}</Badge>
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {task.estimatedEffort}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                        {task.description}
                      </p>
                      <p className="mt-1.5 text-xs text-[var(--accent-secondary)]">
                        Project Suggestion: {task.supportingProjectSuggestion}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </SurfaceCard>
          )}

          {/* INTERVIEW PREPARATION */}
          {activeTab === 'interview' && (
            <SurfaceCard className="p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold">Interview Preparation</h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Tailored to your resume evidence and missing JD requirements.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'technical', label: 'Technical' },
                    { id: 'project_based', label: 'Project' },
                    { id: 'problem_solving', label: 'Problem Solving' },
                    { id: 'missing_requirement', label: 'Gap Probe' },
                    { id: 'behavioral', label: 'Behavioral' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setQuestionFilter(cat.id)}
                      className={`rounded-md border px-2.5 py-1 text-xs ${
                        questionFilter === cat.id
                          ? 'border-[var(--accent-primary)] bg-[#A3E635]/10 text-[var(--accent-primary)]'
                          : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {report.interviewQuestions
                  .filter(
                    (q) =>
                      questionFilter === 'all' || q.category === questionFilter
                  )
                  .map((q) => {
                    const isOpen = openQuestionId === q.id;
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)]"
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenQuestionId(isOpen ? null : q.id)
                          }
                          className="flex w-full items-start justify-between gap-4 p-4 text-left"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone="neutral">
                                {q.category.replace('_', ' ')}
                              </Badge>
                              <Badge
                                tone={
                                  q.difficulty === 'advanced'
                                    ? 'critical'
                                    : q.difficulty === 'intermediate'
                                      ? 'warning'
                                      : 'success'
                                }
                              >
                                {q.difficulty}
                              </Badge>
                              <span className="font-mono text-xs text-[var(--accent-secondary)]">
                                {q.skillTested}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium">{q.question}</p>
                          </div>
                          <ChevronDown
                            className={`mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="border-t border-[var(--border-subtle)] px-4 py-3 text-xs space-y-2">
                            <p className="text-[var(--text-muted)]">
                              <strong className="text-[var(--text-primary)]">
                                Why interviewers ask this:{' '}
                              </strong>
                              {q.whyInterviewerAsks}
                            </p>
                            <p className="text-[var(--accent-secondary)]">
                              <strong>Suggested Answer Framework: </strong>
                              {q.suggestedAnswerFramework}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
}

