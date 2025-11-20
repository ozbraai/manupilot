// components/project/ProjectKeyInfo.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectKeyInfoProps = {
  free: any; // free playbook section
};

// === [2] COMPONENT ROOT ===
export default function ProjectKeyInfo({ free }: ProjectKeyInfoProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {/* === [2.1] TARGET CUSTOMER === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
          👤 Target customer
        </p>
        <p className="text-sm text-slate-700">
          {free?.targetCustomer || 'Not specified yet.'}
        </p>
      </div>

      {/* === [2.2] MANUFACTURING REGIONS === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
          🌍 Manufacturing regions
        </p>
        <p className="text-sm text-slate-700">
          {free?.manufacturingApproach?.recommendedRegions?.length
            ? free.manufacturingApproach.recommendedRegions.join(', ')
            : 'Not defined yet.'}
        </p>
      </div>

      {/* === [2.3] PRICING & POSITIONING === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
          💰 Pricing & positioning
        </p>
        <p className="text-sm text-slate-700 font-medium mb-1">
          {free?.pricing?.positioning || 'Not defined yet.'}
        </p>
        <p className="text-xs text-slate-500">
          {free?.pricing?.insight || ''}
        </p>
      </div>
    </section>
  );
}