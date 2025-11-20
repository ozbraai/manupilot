// app/manufacturers/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Partner } from '@/components/partners/PartnerCard';

// === [1] TYPES ===
type ContactInfo = {
  email?: string;
  website?: string;
  phone?: string;
  wechat?: string;
};

// === [2] PAGE COMPONENT ===
export default function ManufacturerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [manufacturer, setManufacturer] = useState<Partner | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
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

        const ci = (data as any).contact_info || {};
        if (ci && typeof ci === 'object') {
          setContactInfo(ci as ContactInfo);
        }
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
  const location = manufacturer.region || manufacturer.country || 'Region not specified';

  const rating = manufacturer.rating ?? 0;
  const ratingLabel =
    rating > 0 ? `${rating.toFixed(1)} / 5` : 'Not rated yet';

  const hasContact =
    contactInfo.email || contactInfo.website || contactInfo.phone || contactInfo.wechat;

  // === [3] RENDER ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto pt-12 px-4 md:px-0 space-y-8">
        {/* === [3.1] HERO HEADER CARD === */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {/* Logo / Avatar */}
            {manufacturer.image_url ? (
              <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.image_url}
                  alt={manufacturer.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                🏭
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {manufacturer.name}
              </h1>
              <p className="text-sm text-slate-500">
                {location}
              </p>

              {rating > 0 && (
                <p className="mt-1 text-xs text-amber-500 flex items-center gap-1">
                  <span>{'★'.repeat(Math.round(rating))}</span>
                  <span className="text-slate-500">
                    ({ratingLabel})
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Capability chips inline */}
          {caps.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 mt-2">
              {caps.map((cap, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </section>

{/* === [3.2] OVERVIEW + CAPABILITIES — PREMIUM STRUCTURED BLOCK === */}
<section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm">
  
  {/* Inner structured container (mimics blueprint style) */}
  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">

    {/* === OVERVIEW === */}
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
        Overview & strengths
      </h2>
      <p className="text-sm text-slate-700">
        {manufacturer.description || 'No overview has been provided yet.'}
      </p>
    </div>

    {/* === CAPABILITIES === */}
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
        Capabilities
      </h2>

      {caps.length > 0 ? (
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
      ) : (
        <p className="text-sm text-slate-600">No capabilities specified yet.</p>
      )}
    </div>

    {/* === DETAIL STATS ROW === */}
    <div className="grid gap-3 md:grid-cols-3">
      {/* Location */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
          Location
        </p>
        <p className="text-sm text-slate-800">{location}</p>
      </div>

      {/* Rating */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
          Rating
        </p>
        <p className="text-sm text-slate-800">
          {rating > 0 ? `${rating.toFixed(1)} / 5` : 'Not rated yet'}
        </p>
      </div>

      {/* Ideal For */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
          Ideal for
        </p>
        <p className="text-sm text-slate-800">
          {caps.length ? `Projects needing ${caps[0].toLowerCase()}` : 'General OEM work'}
        </p>
      </div>
    </div>

  </div>
</section>

        {/* === [3.3] CONTACT & DETAILS SECTION === */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">
            Contact & details
          </h2>

          {hasContact ? (
            <div className="space-y-1 text-sm text-slate-700">
              {contactInfo.email && (
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-sky-600 hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </p>
              )}
              {contactInfo.website && (
                <p>
                  <span className="font-medium">Website:</span>{' '}
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    {contactInfo.website}
                  </a>
                </p>
              )}
              {contactInfo.phone && (
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {contactInfo.phone}
                </p>
              )}
              {contactInfo.wechat && (
                <p>
                  <span className="font-medium">WeChat:</span>{' '}
                  {contactInfo.wechat}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Contact details, sample requirements, and RFQ integration will be added here in a future version.
            </p>
          )}

          <p className="text-[11px] text-slate-500 mt-2">
            In future, you&apos;ll be able to send structured RFQs to this manufacturer directly from your ManuPilot projects.
          </p>
        </section>
      </div>
    </main>
  );
}