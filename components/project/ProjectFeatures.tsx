// components/project/ProjectFeatures.tsx

'use client';

import React from 'react';

type ProjectFeaturesProps = {
  // Can be a single string, array of strings, or undefined from the playbook
  features: string | string[] | undefined;
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

export default function ProjectFeatures({ features }: ProjectFeaturesProps) {
  const items = ensureArray(features);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Key features
      </h3>
      {items.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {items.map((f, idx) => (
            <li key={idx}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No key features have been defined yet in this playbook.
        </p>
      )}
    </div>
  );
}