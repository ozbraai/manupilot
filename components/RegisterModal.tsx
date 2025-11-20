'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type PartnerType =
  | 'founder'
  | 'manufacturer'
  | 'agent'
  | 'shipper'
  | 'legal'
  | 'other';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string | null) => void;
  onSwitchToLogin?: () => void; // optional: navbar uses it, homepage doesn't have to
};

export default function RegisterModal({
  open,
  onClose,
  onAuthSuccess,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [partnerType, setPartnerType] = useState<PartnerType>('founder');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            companyName,
            partnerType,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || 'Registration failed.');
      }

      onAuthSuccess(data.user?.email ?? email);
      onClose();
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchToLogin() {
    onClose();
    if (onSwitchToLogin) {
      onSwitchToLogin(); // safe optional call
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Create your ManuPilot account
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Tell us who you are so we can personalise your ManuPilot experience.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-sm">
          {/* Full name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              placeholder="Jane Founder"
            />
          </div>

          {/* Company */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Company / brand name (optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              placeholder="My Outdoor Brand"
            />
          </div>

          {/* Partner type */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              I am primarily a…
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(
                [
                  ['founder', 'Product creator / brand'],
                  ['manufacturer', 'Manufacturer / factory'],
                  ['agent', 'Sourcing agent'],
                  ['shipper', 'Shipping / freight'],
                  ['legal', 'Legal / compliance'],
                  ['other', 'Other'],
                ] as [PartnerType, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPartnerType(value)}
                  className={
                    'rounded-xl border px-3 py-2 text-left ' +
                    (partnerType === value
                      ? 'border-sky-500 bg-sky-50 text-sky-800'
                      : 'border-slate-300 bg-white text-slate-700')
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              placeholder="you@company.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              placeholder="Choose a secure password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-full bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-500 disabled:opacity-50 transition"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Switch to login */}
        <div className="mt-4 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="text-sky-600 font-medium hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}