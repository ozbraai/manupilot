// components/project/ProjectNextSteps.tsx

'use client';

import React from 'react';

type ProjectNextStepsProps = {
  // Can be a single string, an array, or undefined from the playbook
  nextSteps: string | string[] | undefined;
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

export default function ProjectNextSteps({
  nextSteps,
}: ProjectNextStepsProps) {
  const items = ensureArray(nextSteps);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Suggested next steps
      </h3>
      {items.length ? (
        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
          {items.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-600">
          No specific next steps have been documented yet. As you progress,
          use this section to capture the most important actions to keep the
          project moving.
        </p>
      )}
    </div>
  );
}