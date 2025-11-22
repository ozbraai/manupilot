// components/project/ProjectRisks.tsx

'use client';

import React from 'react';

type ProjectRisksProps = {
  // Can be a single string, an array, or undefined
  risks: string | string[] | undefined;
};

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function ensureArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return linesToArray(value);
  return [];
}

export default function ProjectRisks({ risks }: ProjectRisksProps) {
  const items = ensureArray(risks);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Key risks & trade-offs
      </h3>
      {items.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {items.map((risk, idx) => (
            <li key={idx}>{risk}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No specific risks have been documented yet. As you move forward, note
          down things like MOQ exposure, tooling costs, lead times, or supplier
          reliability concerns here.
        </p>
      )}
    </div>
  );
}