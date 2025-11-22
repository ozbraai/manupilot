// components/project/ProjectMaterials.tsx

'use client';

import React from 'react';

type ProjectMaterialsProps = {
  // free.materials can now be a string or an array (or undefined)
  materials: string | string[] | undefined;
};

function ensureArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ProjectMaterials({ materials }: ProjectMaterialsProps) {
  const items = ensureArray(materials);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        Materials & finishes
      </h3>
      {items.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {items.map((m: string, idx: number) => (
            <li key={idx}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No specific materials have been defined yet in this playbook.
        </p>
      )}
    </div>
  );
}