// components/RegisterModal.tsx

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string | null) => void;
  onSwitchToLogin: () => void;
};

type PartnerType =
  | 'founder'
  | 'manufacturer'
  | 'agent'
  | 'shipper'
  | 'legal'
  | 'other';

export function RegisterModal({
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

  async function handleSubmit(e: React.FormEvent) {
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
        setError(signUpError.message || 'Failed to register.');
        return;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
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

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Full name
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Founder"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Company / brand name (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="My Outdoor Brand"
            />
          </div>

          {/* Partner type selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              I am primarily a…
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPartnerType('founder')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'founder'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Product creator / brand
              </button>
              <button
                type="button"
                onClick={() => setPartnerType('manufacturer')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'manufacturer'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Manufacturer / factory
              </button>
              <button
                type="button"
                onClick={() => setPartnerType('agent')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'agent'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Sourcing agent
              </button>
              <button
                type="button"
                onClick={() => setPartnerType('shipper')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'shipper'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Shipping / freight
              </button>
              <button
                type="button"
                onClick={() => setPartnerType('legal')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'legal'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Legal / compliance
              </button>
              <button
                type="button"
                onClick={() => setPartnerType('other')}
                className={
                  'rounded-xl border px-3 py-2 text-left ' +
                  (partnerType === 'other'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-700')
                }
              >
                Other
              </button>
            </div>
          </div>

          {/* Email & password */}
          <div className="space-y-1 pt-1">
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
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <div className="px-5 py-3 border-t border-slate-200 text-center text-xs text-slate-600">
          Already a member?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-sky-600 font-medium hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}