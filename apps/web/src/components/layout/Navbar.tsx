import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';

  const handleLogout = async (): Promise<void> => {
    setMobileOpen(false);
    navigate('/', { replace: true });
    await logout();
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[var(--text-primary)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#A3E635]/40 bg-[#A3E635]/15 text-[var(--accent-primary)]">
              <FileCheck2 className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              ScreenMe
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm text-[var(--text-muted)] md:flex"
          >
            {isLanding ? (
              <>
                <a href="#product" className="hover:text-[var(--text-primary)]">
                  Product
                </a>
                <a href="#how-it-works" className="hover:text-[var(--text-primary)]">
                  How It Works
                </a>
                <a href="#features" className="hover:text-[var(--text-primary)]">
                  Features
                </a>
                <a href="#faq" className="hover:text-[var(--text-primary)]">
                  FAQ
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/analyze"
                  className={
                    location.pathname === '/analyze'
                      ? 'font-medium text-[var(--accent-primary)]'
                      : 'hover:text-[var(--text-primary)]'
                  }
                >
                  Analyze
                </Link>
                <Link
                  to="/sample-report"
                  className={
                    location.pathname === '/sample-report'
                      ? 'font-medium text-[var(--accent-primary)]'
                      : 'hover:text-[var(--text-primary)]'
                  }
                >
                  Sample Report
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    className={
                      location.pathname === '/dashboard'
                        ? 'font-medium text-[var(--accent-primary)]'
                        : 'hover:text-[var(--text-primary)]'
                    }
                  >
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[var(--accent-secondary)]" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Sign In
            </Link>
          )}

          <Link
            to="/analyze"
            className="rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--accent-primary-ink)] transition-opacity hover:opacity-90"
          >
            Analyze Resume
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link
              to="/analyze"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-[var(--accent-primary-bg)] px-4 py-2.5 text-center font-semibold text-[var(--accent-primary-ink)]"
            >
              Analyze Resume
            </Link>
            <Link
              to="/sample-report"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-[var(--text-primary)]"
            >
              Explore Sample Report
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-[var(--text-primary)]"
                >
                  Dashboard ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-left text-[var(--status-critical)]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-[var(--text-primary)]"
              >
                Sign In / Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

