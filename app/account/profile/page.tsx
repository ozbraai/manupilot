// app/account/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type PartnerType =
  | 'founder'
  | 'manufacturer'
  | 'agent'
  | 'shipper'
  | 'legal'
  | 'other';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [partnerType, setPartnerType] = useState<PartnerType>('founder');
  const [location, setLocation] = useState('');
  const [capabilities, setCapabilities] = useState(''); // comma separated

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          setError(authError.message || 'Not logged in.');
          return;
        }
        if (!user) {
          setError('Not logged in.');
          return;
        }

        setEmail(user.email || '');

        const meta: any = user.user_metadata || {};
        setFullName(meta.fullName || '');
        setCompanyName(meta.companyName || '');
        setPartnerType((meta.partnerType as PartnerType) || 'founder');
        setLocation(meta.location || '');
        setCapabilities(
          Array.isArray(meta.capabilities)
            ? (meta.capabilities as string[]).join(', ')
            : meta.capabilities || ''
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const capsArray = capabilities
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          fullName,
          companyName,
          partnerType,
          location,
          capabilities: capsArray,
        },
      });

      if (updateError) {
        setError(updateError.message || 'Failed to save profile.');
        return;
      }

      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </main>
    );
  }

  if (error && !email) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto pt-12 px-4 md:px-0 space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Profile & settings
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Keep your ManuPilot profile up to date so projects and partners can be
            tailored to what you do.
          </p>

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                {success}
              </p>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Company / brand name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            {/* Partner type selector */}
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

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Example: Shenzhen, China / Sydney, Australia"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Capabilities (comma separated)
              </label>
              <input
                type="text"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="Outdoor products, Metal fabrication, Bag manufacturer"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                These tags can later be used to match you to projects and appear in the
                directory.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}