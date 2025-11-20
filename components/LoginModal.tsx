// components/LoginModal.tsx

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string | null) => void;
  onSwitchToRegister: () => void;
};

export function LoginModal({
  open,
  onClose,
  onAuthSuccess,
  onSwitchToRegister,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(authError.message || 'Failed to log in.');
        return;
      }

      onAuthSuccess(data.user?.email ?? null);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Log in to ManuPilot
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-500 disabled:opacity-60 transition"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="px-5 py-3 border-t border-slate-200 text-center text-xs text-slate-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-sky-600 font-medium hover:underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}