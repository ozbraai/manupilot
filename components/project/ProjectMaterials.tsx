// components/project/ProjectMaterials.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectMaterialsProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectMaterials({ free }: ProjectMaterialsProps) {
  const materials = free?.materials || [];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        🧱 Materials
      </h2>

      {/* === [2.2] CONTENT === */}
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
    </section>
  );
}