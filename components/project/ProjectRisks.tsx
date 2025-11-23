// components/project/ProjectRisks.tsx
'use client';

import React from 'react';

type ProjectRisksProps = {
  risks: string[] | undefined;
  dfmWarnings?: string[] | undefined; // NEW: Design for Mfg warnings
};

export default function ProjectRisks({ risks, dfmWarnings }: ProjectRisksProps) {
  const hasRisks = risks && risks.length > 0;
  const hasDfm = dfmWarnings && dfmWarnings.length > 0;

  if (!hasRisks && !hasDfm) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Key risks & trade-offs</h3>
        <p className="text-sm text-slate-600">No specific risks documented yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* General Risks */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">🚨 Commercial & Supply Risks</h3>
        {hasRisks ? (
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {risks?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None detected.</p>
        )}
      </div>

      {/* DFM Warnings (The "Engineer" View) */}
      {hasDfm && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-amber-700 mb-2">🛠️ DFM (Design for Mfg) Warnings</h3>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
              {dfmWarnings?.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}