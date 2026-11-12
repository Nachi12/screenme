import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  GitCompare,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  SurfaceCard,
  scoreTone,
} from '../components/ui/Primitives';
import { useAuth } from '../context/AuthContext';
import {
  api,
  ApiClientError,
  type ReportListItem,
  type ReportListResponse,
} from '../services/apiClient';

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<ReportListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'match_desc'>('newest');
  const [compareGroup, setCompareGroup] = useState<ReportListItem[] | null>(
    null
  );

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listReports({
        search: search || undefined,
        role: roleFilter || undefined,
        sort,
      });
      setData(res);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to load your analysis history.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, sort]);

  useEffect(() => {
    if (user) {
      void fetchReports();
    }
  }, [user, fetchReports]);

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Permanently delete this analysis report and its roadmap progress?')) {
      return;
    }
    try {
      await api.deleteReport(id);
      await fetchReports();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : 'Unable to delete report.'
      );
    }
  };

  const uniqueRoles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.reports.map((r) => r.jobTitle)));
  }, [data]);

  const comparableGroups = useMemo(() => {
    if (!data) return new Map<string, ReportListItem[]>();
    const map = new Map<string, ReportListItem[]>();
    for (const r of data.reports) {
      const list = map.get(r.jdHash) ?? [];
      list.push(r);
      map.set(r.jdHash, list);
    }
    return map;
  }, [data]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--bg-surface-2)]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent-secondary)]">
            Report History
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Compare updated resumes against the same job description and track your progress.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-primary-ink)]"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard className="p-5">
          <p className="text-xs text-[var(--text-muted)]">Total Analyses</p>
          <p className="mt-2 font-mono text-3xl font-bold">
            {data?.summary.totalAnalyses ?? 0}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <p className="text-xs text-[var(--text-muted)]">Most Recent JD Match</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[var(--accent-primary)]">
            {data?.summary.mostRecentJobMatch !== null &&
            data?.summary.mostRecentJobMatch !== undefined
              ? `${data.summary.mostRecentJobMatch}/100`
              : '—'}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <p className="text-xs text-[var(--text-muted)]">
            Comparable Trend (Same JD & Version)
          </p>
          <p className="mt-2 font-mono text-3xl font-bold">
            {data?.summary.comparableImprovementDelta !== null &&
            data?.summary.comparableImprovementDelta !== undefined
              ? `${data.summary.comparableImprovementDelta >= 0 ? '+' : ''}${data.summary.comparableImprovementDelta} pts`
              : '—'}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <p className="text-xs text-[var(--text-muted)]">Recent Activity</p>
          <p className="mt-2 text-sm font-medium">
            {data?.reports[0]
              ? `${data.reports[0].jobTitle} (${new Date(data.reports[0].createdAt).toLocaleDateString('en-IN')})`
              : 'No analyses yet'}
          </p>
        </SurfaceCard>
      </div>

      {/* Search & Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or candidate..."
            aria-label="Search reports"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 pr-3 pl-9 text-sm"
          />
        </div>

        <select
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort reports"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as 'newest' | 'oldest' | 'match_desc')
          }
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="match_desc">Highest JD Match</option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-sm text-[var(--status-critical)]"
        >
          {error}
        </div>
      )}

      {/* Comparison Drawer */}
      {compareGroup && (
        <SurfaceCard className="mt-6 p-5" elevated>
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-base font-semibold">
                Same-JD Comparison: {compareGroup[0]?.jobTitle}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {new Set(compareGroup.map((g) => g.scoringVersion)).size > 1
                  ? 'Notice: Selected reports use different scoring versions; interpret score deltas cautiously.'
                  : `All compared reports use scoring version ${compareGroup[0]?.scoringVersion}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompareGroup(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compareGroup.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <p className="font-mono text-xs text-[var(--text-muted)]">
                  {new Date(item.createdAt).toLocaleString('en-IN')}
                </p>
                <div className="mt-2 flex items-baseline gap-4">
                  <div>
                    <p className="text-[11px] text-[var(--text-muted)]">JD Match</p>
                    <p className="font-mono text-xl font-bold text-[var(--accent-primary)]">
                      {item.jobMatchScore ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--text-muted)]">ATS</p>
                    <p className="font-mono text-xl font-bold">{item.atsScore}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Verdict: {item.hrVerdict} · {item.scoringVersion}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      {/* Reports List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
        ) : !data || data.reports.length === 0 ? (
          <SurfaceCard className="p-10 text-center">
            <p className="text-base font-semibold">No saved analyses yet</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Run your first resume analysis to start tracking improvements over time.
            </p>
            <Link
              to="/analyze"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-primary-ink)]"
            >
              Analyze My Resume <ArrowRight className="h-4 w-4" />
            </Link>
          </SurfaceCard>
        ) : (
          data.reports.map((rep) => {
            const sameJdList = comparableGroups.get(rep.jdHash) ?? [];
            return (
              <SurfaceCard
                key={rep.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{rep.jobTitle}</h2>
                    <span className="text-sm text-[var(--text-muted)]">
                      at {rep.companyName}
                    </span>
                    <Badge tone="neutral">{rep.scoringVersion}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Analyzed{' '}
                    {new Date(rep.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    · Verdict: <span className="text-[var(--text-primary)]">{rep.hrVerdict}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={scoreTone(rep.jobMatchScore)}>
                      Match {rep.jobMatchScore ?? 'N/A'}
                    </Badge>
                    <Badge tone={scoreTone(rep.atsScore)}>
                      ATS {rep.atsScore}
                    </Badge>
                  </div>

                  {sameJdList.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setCompareGroup(sameJdList)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs hover:bg-[var(--bg-surface-2)]"
                    >
                      <GitCompare className="h-3.5 w-3.5 text-[var(--accent-secondary)]" />
                      Compare ({sameJdList.length})
                    </button>
                  )}

                  <Link
                    to={`/reports/${rep.id}`}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent-primary)]"
                  >
                    Open Report
                  </Link>

                  <button
                    type="button"
                    aria-label={`Delete report for ${rep.jobTitle}`}
                    onClick={() => void handleDelete(rep.id)}
                    className="rounded-lg border border-[var(--border-subtle)] p-1.5 text-[var(--status-critical)] hover:bg-[var(--bg-surface-2)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </SurfaceCard>
            );
          })
        )}
      </div>
    </div>
  );
}

