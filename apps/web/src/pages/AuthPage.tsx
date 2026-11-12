import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { PrimaryButton, SurfaceCard } from '../components/ui/Primitives';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/apiClient';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export function AuthPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        setUser(res.user);
        navigate('/dashboard');
      } else if (mode === 'register') {
        const res = await api.register({ name, email, password });
        setUser(res.user);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setNotice(
          res.devResetToken
            ? `${res.message} Development reset token: ${res.devResetToken}`
            : res.message
        );
        if (res.devResetToken) {
          setResetToken(res.devResetToken);
          setMode('reset');
        }
      } else {
        const res = await api.resetPassword({
          token: resetToken,
          newPassword: password,
        });
        setNotice(res.message);
        setPassword('');
        setMode('login');
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Authentication request failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <SurfaceCard className="p-6 sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">
          {mode === 'login'
            ? 'Sign In to ScreenMe'
            : mode === 'register'
              ? 'Create Your ScreenMe Account'
              : mode === 'forgot'
                ? 'Reset Your Password'
                : 'Enter New Password'}
        </h1>
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
          Save analysis history, track roadmap progress, and compare resume iterations.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-medium text-[var(--text-muted)]"
              >
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Kulkarni"
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-[var(--text-muted)]"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
              />
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label
                htmlFor="auth-token"
                className="block text-xs font-medium text-[var(--text-muted)]"
              >
                Reset Token
              </label>
              <input
                id="auth-token"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 font-mono text-xs"
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-[var(--text-muted)]"
              >
                {mode === 'reset' ? 'New Password (min 8 chars)' : 'Password'}
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={mode === 'login' ? 1 : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-sm"
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#F87171]/40 bg-[#F87171]/10 p-3 text-xs text-[var(--status-critical)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2 rounded-lg border border-[#4ADE80]/40 bg-[#4ADE80]/10 p-3 text-xs text-[var(--status-success)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-all">{notice}</span>
            </div>
          )}

          <PrimaryButton
            type="submit"
            disabled={submitting}
            className="w-full py-2.5"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                  ? 'Create Account'
                  : mode === 'forgot'
                    ? 'Send Reset Link'
                    : 'Update Password'}
          </PrimaryButton>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted)]">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="hover:text-[var(--text-primary)]"
              >
                Need an account? Sign up
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('forgot');
                }}
                className="hover:text-[var(--text-primary)]"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="hover:text-[var(--text-primary)]"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}

