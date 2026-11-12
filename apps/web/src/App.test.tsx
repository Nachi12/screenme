import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SAMPLE_DEMONSTRATION_REPORT } from '@screenme/shared';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnalyzePage } from './pages/AnalyzePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ReportPage } from './pages/ReportPage';

function mockFetchDefault(authenticated = false) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/auth/me')) {
      if (authenticated) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { user: { id: 'u1', name: 'Aarav Kulkarni', email: 'aarav@example.com' } },
          }),
        };
      }
      return {
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        }),
      };
    }
    if (url.includes('/reports?') || url.endsWith('/reports')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            reports: [],
            pagination: { total: 0, page: 1, limit: 20 },
            summary: {
              totalAnalyses: 0,
              mostRecentJobMatch: null,
              comparableImprovementDelta: null,
            },
          },
        }),
      };
    }
    if (url.includes('/reports/missing-id')) {
      return {
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Report not found.' },
        }),
      };
    }
    if (url.includes('/reports/real-report-1')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            report: {
              ...SAMPLE_DEMONSTRATION_REPORT,
              id: 'real-report-1',
              isSample: false,
              candidateName: 'Priya Nair',
            },
          },
        }),
      };
    }
    if (url.endsWith('/auth/logout')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { loggedOut: true } }),
      };
    }
    return {
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' },
      }),
    };
  });
}

beforeAll(() => {
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  vi.stubGlobal('fetch', mockFetchDefault(false));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderAppShell(initialRoute: string) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/sample-report" element={<ReportPage isSample />} />
              <Route path="/reports/:reportId" element={<ReportPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>
          <Footer />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('ScreenMe Web UI', () => {
  it('renders the Landing Page hero and core value proposition', () => {
    renderAppShell('/');
    expect(
      screen.getByRole('heading', {
        name: /Your Resume Deserves More Than an ATS Score/i,
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Explore Sample Report/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles theme between dark and light via navbar control', () => {
    renderAppShell('/');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const toggleButtons = screen.getAllByLabelText(/Switch to light theme/i);
    fireEvent.click(toggleButtons[0]!);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders /analyze workspace, validates missing resume, and allows experience selection', async () => {
    renderAppShell('/analyze');
    expect(
      screen.getByRole('heading', { name: /Analyze Your Resume Against a Job Description/i })
    ).toBeInTheDocument();

    const expSelect = screen.getByLabelText(/Experience Level/i) as HTMLSelectElement;
    fireEvent.change(expSelect, { target: { value: '0_1_year' } });
    expect(expSelect.value).toBe('0_1_year');

    const submitBtn = screen.getByRole('button', { name: /Run ScreenMe Analysis/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Please upload a valid PDF or DOCX resume first/i)
    ).toBeInTheDocument();
  });

  it('renders the unauthenticated Demonstration Report, interactive tabs, and PDF export link', () => {
    renderAppShell('/sample-report');
    expect(screen.getByText(/Demonstration Report:/i)).toBeInTheDocument();
    expect(screen.getByText(/Potential Match/i)).toBeInTheDocument();

    const exportLink = screen.getByRole('link', { name: /Export PDF/i });
    expect(exportLink).toHaveAttribute('href', expect.stringContaining('/reports/'));

    fireEvent.click(screen.getByRole('button', { name: /ATS Compatibility/i }));
    expect(screen.getByText(/ATS Compatibility Evaluation/i)).toBeInTheDocument();
  });

  it('renders fetched /reports/:reportId and displays honest error without fake data on missing report', async () => {
    renderAppShell('/reports/missing-id');
    expect(await screen.findByText(/Report Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Report not found/i)).toBeInTheDocument();

    cleanup();
    renderAppShell('/reports/real-report-1');
    expect(await screen.findByText(/Priya Nair/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated /dashboard users to /auth and supports authenticated logout', async () => {
    renderAppShell('/dashboard');
    expect(
      await screen.findByRole('heading', { name: /Sign In to ScreenMe/i })
    ).toBeInTheDocument();

    cleanup();
    vi.stubGlobal('fetch', mockFetchDefault(true));
    renderAppShell('/dashboard');
    expect(await screen.findByText(/Welcome back, Aarav/i)).toBeInTheDocument();

    const signOutBtn = screen.getByLabelText(/Sign out/i);
    fireEvent.click(signOutBtn);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Your Resume Deserves More Than an ATS Score/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders /auth mode switching and /privacy disclosure page', () => {
    renderAppShell('/auth');
    expect(
      screen.getByRole('heading', { name: /Sign In to ScreenMe/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Need an account\? Sign up/i }));
    expect(
      screen.getByRole('heading', { name: /Create Your ScreenMe Account/i })
    ).toBeInTheDocument();

    cleanup();
    renderAppShell('/privacy');
    expect(
      screen.getByRole('heading', { name: /Privacy & AI Data Processing Notice/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini AI Processing/i)).toBeInTheDocument();
  });
});
