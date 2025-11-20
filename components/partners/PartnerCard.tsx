// components/partners/PartnerCard.tsx

'use client';

import React from 'react';
import Link from 'next/link';

// === [1] TYPES ===
export type Partner = {
  id: string;
  type: string;
  name: string;
  region: string | null;
  country?: string | null;
  description: string | null;
  capabilities?: string[] | null;
  rating?: number | null;
  image_url?: string | null;
};

type PartnerCardProps = {
  partner: Partner;
  basePath: string; // e.g. "manufacturers", "agents", "shipping-partners", "legal-services"
};

// === [2] COMPONENT ROOT ===
export default function PartnerCard({ partner, basePath }: PartnerCardProps) {
  const rating = partner.rating ?? 0;
  const capabilities = partner.capabilities || [];

  return (
    <Link
      href={`/${basePath}/${partner.id}`}
      className="group block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >
      {/* === [2.1] IMAGE & NAME === */}
      <div className="flex items-start gap-4">
        {partner.image_url ? (
          <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partner.image_url}
              alt={partner.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
            🏭
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-700">
            {partner.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {partner.region || partner.country || 'Region not specified'}
          </p>

          {/* Rating */}
          {rating > 0 && (
            <p className="mt-1 text-xs text-amber-500">
              {'★'.repeat(Math.round(rating))}{' '}
              <span className="text-slate-500">
                ({rating.toFixed(1)} / 5)
              </span>
            </p>
          )}
        </div>
      </div>

      {/* === [2.2] DESCRIPTION === */}
      {partner.description && (
        <p className="mt-3 text-sm text-slate-700 line-clamp-3">
          {partner.description}
        </p>
      )}

      {/* === [2.3] TAGS (CAPABILITIES) === */}
      {capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {capabilities.slice(0, 4).map((cap, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {cap}
            </span>
          ))}
          {capabilities.length > 4 && (
            <span className="text-[11px] text-slate-500">
              +{capabilities.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* === [2.4] CTA HINT === */}
      <p className="mt-3 text-[11px] text-sky-600 font-medium">
        View profile →
      </p>
    </Link>
  );
}