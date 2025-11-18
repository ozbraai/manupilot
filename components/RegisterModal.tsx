'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string | null) => void;
};

export function RegisterModal({
  open,
  onClose,
  onAuthSuccess,
}: RegisterModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Optionally sign in immediately after sign-up
    if (email && password) {
      await supabase.auth.signInWithPassword({ email, password });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      onAuthSuccess(user?.email ?? null);
    }

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 px-6 py-6 md:px-8 md:py-7 transform transition-all duration-200 ease-out scale-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Create account</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          {message && (
            <p className="text-xs text-red-600 mt-1">{message}</p>
          )}

          <p className="text-[11px] text-slate-400 mt-2">
            By creating an account you agree that this is an early prototype. You
            can delete your data at any time.
          </p>
        </form>
      </div>
    </div>
  );
}