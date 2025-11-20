// components/project/ProjectNextSteps.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectNextStepsProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectNextSteps({ free }: ProjectNextStepsProps) {
  const steps = free?.nextSteps || [];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        ✅ Suggested next steps
      </h2>

      {/* === [2.2] CONTENT === */}
      {steps.length ? (
        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
          {steps.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-600">
          No next steps have been suggested yet.
        </p>
      )}
    </section>
  );
}