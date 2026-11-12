import React from 'react';

export function SurfaceCard({
  children,
  className = '',
  elevated = false,
}: {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] ${
        elevated ? 'bg-[var(--bg-surface-2)]' : 'bg-[var(--bg-surface)]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

type BadgeTone = 'neutral' | 'accent' | 'teal' | 'success' | 'warning' | 'critical';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    'border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-muted)]',
  accent:
    'border-[#A3E635]/40 bg-[#A3E635]/10 text-[var(--accent-primary)]',
  teal:
    'border-[#2DD4BF]/40 bg-[#2DD4BF]/10 text-[var(--accent-secondary)]',
  success:
    'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[var(--status-success)]',
  warning:
    'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[var(--status-warning)]',
  critical:
    'border-[#F87171]/40 bg-[#F87171]/10 text-[var(--status-critical)]',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium tracking-tight ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-primary-ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function scoreTone(score: number | null): BadgeTone {
  if (score === null) return 'neutral';
  if (score >= 75) return 'success';
  if (score >= 55) return 'warning';
  return 'critical';
}

