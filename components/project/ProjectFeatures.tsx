// components/project/ProjectFeatures.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectFeaturesProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectFeatures({ free }: ProjectFeaturesProps) {
  const features = free?.keyFeatures || [];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        ⭐ Key features
      </h2>

      {/* === [2.2] CONTENT === */}
      {features.length ? (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {features.map((f: string, idx: number) => (
            <li key={idx}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No key features captured yet.
        </p>
      )}
    </section>
  );
}