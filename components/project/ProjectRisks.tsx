// components/project/ProjectRisks.tsx

'use client';

import React from 'react';

type ProjectRisksProps = {
  free: any;
};

export default function ProjectRisks({ free }: ProjectRisksProps) {
  const risks = free?.manufacturingApproach?.risks || [];

  if (!risks.length) return null;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-col space-y-2">
      <h2 className="text-sm font-semibold text-slate-900">
        ⚠️ Risks to watch
      </h2>
      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
        {risks.map((risk: string, idx: number) => (
          <li key={idx}>{risk}</li>
        ))}
      </ul>
      <p className="text-[11px] text-amber-700">
        Use this to plan QC checks, sampling, and mitigation with suppliers.
      </p>
    </div>
  );
}