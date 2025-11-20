// components/project/ProjectApproach.tsx

'use client';

import React from 'react';

type ProjectApproachProps = {
  free: any;
};

export default function ProjectApproach({ free }: ProjectApproachProps) {
  const rationale = free?.manufacturingApproach?.rationale || '';

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col space-y-2">
      <h2 className="text-sm font-semibold text-slate-900">
        ⚙️ Manufacturing approach
      </h2>
      <p className="text-sm text-slate-700">
        {rationale ||
          'No detailed manufacturing rationale has been generated yet.'}
      </p>
    </div>
  );
}