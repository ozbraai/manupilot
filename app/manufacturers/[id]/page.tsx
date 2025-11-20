// app/manufacturers/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Partner } from '@/components/partners/PartnerCard';

// === [1] PAGE COMPONENT ===
export default function ManufacturerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [manufacturer, setManufacturer] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!id) return;
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('partners')
          .select('*')
          .eq('id', id)
          .eq('type', 'manufacturer')
          .single();

        if (dbError) {
          console.error('Manufacturer load error:', dbError);
          setError('Could not load manufacturer.');
          return;
        }

        setManufacturer(data as Partner);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading manufacturer…</p>
      </main>
    );
  }

  if (error || !manufacturer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          {error || 'Manufacturer not found.'}
        </p>
      </main>
    );
  }

  const caps = manufacturer.capabilities || [];

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto pt-12 px-4 md:px-0 space-y-8">
        {/* HEADER */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex items-start gap-4 flex-1">
            {manufacturer.image_url ? (
              <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.image_url}
                  alt={manufacturer.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                🏭
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {manufacturer.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {manufacturer.region || manufacturer.country || 'Region not specified'}
              </p>
              {manufacturer.rating && (
                <p className="mt-1 text-xs text-amber-500">
                  {'★'.repeat(Math.round(manufacturer.rating))}{' '}
                  <span className="text-slate-500">
                    ({manufacturer.rating.toFixed(1)} / 5)
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* CAPABILITIES & DESCRIPTION */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          {manufacturer.description && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Overview
              </h2>
              <p className="text-sm text-slate-700">
                {manufacturer.description}
              </p>
            </div>
          )}

          {caps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {caps.map((cap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CONTACT INFO (placeholder) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">
            Contact & details
          </h2>
          <p className="text-sm text-slate-600">
            Contact details, sample requirements, and RFQ integration will be
            added here in a future version.
          </p>
        </section>
      </div>
    </main>
  );
}