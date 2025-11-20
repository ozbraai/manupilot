// components/project/ProjectPremiumCTA.tsx

'use client';

import React from 'react';

// === [1] COMPONENT ROOT ===
export default function ProjectPremiumCTA() {
  return (
    <section className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* === [1.1] TEXT SIDE === */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Unlock full manufacturing intelligence
        </h2>
        <p className="text-sm text-slate-600">
          Get a detailed cost breakdown, Bill of Materials, compliance checklist, and competitor insights for this product. Perfect when you&apos;re ready to move from planning into serious production.
        </p>
      </div>

      {/* === [1.2] CTA SIDE === */}
      <div className="flex flex-col gap-2 md:items-end">
        <button
          type="button"
          className="px-5 py-2.5 rounded-full bg-amber-500 text-slate-900 text-sm font-medium hover:bg-amber-400 transition"
        >
          🔒 Get Premium Playbook
        </button>
        <p className="text-[11px] text-slate-500">
          Premium pricing TBD – will include deep costing, BOM and compliance analysis.
        </p>
      </div>
    </section>
  );
}