// components/project/ProjectRisks.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectRisksProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectRisks({ free }: ProjectRisksProps) {
  const risks = free?.manufacturingApproach?.risks || [];

  if (!risks.length) return null;

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900">
        ⚠️ Risks to watch
      </h2>

      {/* === [2.2] CONTENT === */}
      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
        {risks.map((risk: string, idx: number) => (
          <li key={idx}>{risk}</li>
        ))}
      </ul>

      {/* === [2.3] FOOTER === */}
      <p className="text-[11px] text-amber-700">
        Use this to plan QC steps, sampling, and mitigation with suppliers.
      </p>
    </section>
  );
}