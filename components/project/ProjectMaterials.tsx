// components/project/ProjectMaterials.tsx

'use client';

import React from 'react';

type ProjectMaterialsProps = {
  free: any;
};

export default function ProjectMaterials({ free }: ProjectMaterialsProps) {
  const materials = free?.materials || [];

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">
        🧱 Materials
      </h2>
      {materials.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {materials.map((m: string, idx: number) => (
            <li key={idx}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No materials have been captured yet.
        </p>
      )}
    </div>
  );
}