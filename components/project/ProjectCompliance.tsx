// components/project/ProjectCompliance.tsx
'use client';

import React from 'react';

type ProjectComplianceProps = {
  tasks: string[] | undefined;
  market?: string;
};

export default function ProjectCompliance({ tasks, market }: ProjectComplianceProps) {
  // Map codes to labels
  const marketLabels: Record<string, string> = {
    US: '🇺🇸 United States',
    EU: '🇪🇺 European Union',
    AU: '🇦🇺 Australia / NZ',
    UK: '🇬🇧 United Kingdom',
    GLOBAL: '🌍 Global',
  };

  const marketLabel = marketLabels[market || ''] || market || 'Global';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">⚖️ Compliance & Certification</h3>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {marketLabel}
        </span>
      </div>

      {tasks && tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          No specific compliance tasks generated. Ensure you check local regulations for {marketLabel}.
        </p>
      )}
    </div>
  );
}