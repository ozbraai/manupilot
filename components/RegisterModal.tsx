'use client';

import { useState } from 'react';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string | null) => void;
  onSwitchToLogin?: () => void; // <-- OPTIONAL now
};

export default function RegisterModal({
  open,
  onClose,
  onAuthSuccess,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null; // Modal hidden

  async function handleRegister() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Registration failed.');

      onAuthSuccess(email);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Create your account</h2>
        <p className="text-sm text-slate-600 mb-4">
          Start your ManuPilot journey — it's free!
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secure password"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-6 bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 transition"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-sky-600 font-medium hover:underline"
            onClick={() => {
              onClose();
              if (onSwitchToLogin) onSwitchToLogin(); // safe optional call
            }}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}