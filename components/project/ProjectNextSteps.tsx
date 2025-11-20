// components/project/ProjectNextSteps.tsx

'use client';

import React from 'react';

type ProjectNextStepsProps = {
  free: any;
};

export default function ProjectNextSteps({ free }: ProjectNextStepsProps) {
  const steps = free?.nextSteps || [];

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">
        ✅ Suggested next steps
      </h2>
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
    </div>
  );
}