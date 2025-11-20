// components/project/ProjectFeatures.tsx

'use client';

import React from 'react';

type ProjectFeaturesProps = {
  free: any;
};

export default function ProjectFeatures({ free }: ProjectFeaturesProps) {
  const features = free?.keyFeatures || [];

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">
        ⭐ Key features
      </h2>
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
    </div>
  );
}