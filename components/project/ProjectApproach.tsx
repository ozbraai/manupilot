// components/project/ProjectApproach.tsx

'use client';

import React from 'react';

type ProjectApproachProps = {
  // Can be a single string, an array of bullet points, or undefined
  approach: string | string[] | undefined;
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

export default function ProjectApproach({ approach }: ProjectApproachProps) {
  const items = ensureArray(approach);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Manufacturing approach
      </h3>
      {items.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No specific manufacturing approach has been defined yet in this
          playbook.
        </p>
      )}
    </div>
  );
}