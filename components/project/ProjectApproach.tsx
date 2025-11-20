// components/project/ProjectApproach.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectApproachProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectApproach({ free }: ProjectApproachProps) {
  const rationale = free?.manufacturingApproach?.rationale;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900">
        ⚙️ Manufacturing approach
      </h2>

      {/* === [2.2] CONTENT === */}
      <p className="text-sm text-slate-700">
        {rationale || 'No detailed manufacturing rationale has been generated yet.'}
      </p>
    </section>
  );
}