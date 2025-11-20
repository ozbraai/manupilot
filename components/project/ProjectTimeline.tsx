// components/project/ProjectTimeline.tsx

'use client';

import React from 'react';

type ProjectTimelineProps = {
  free: any;
};

export default function ProjectTimeline({ free }: ProjectTimelineProps) {
  const timeline = free?.timeline || [];

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">
        ⏱ High-level timeline
      </h2>
      {timeline.length ? (
        <div className="relative pl-4">
          <div className="absolute left-1 top-1 bottom-1 w-px bg-slate-200" />
          <ul className="space-y-3 text-sm text-slate-700">
            {timeline.map((step: string, idx: number) => (
              <li key={idx} className="relative flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 inline-block" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          No timeline has been generated yet.
        </p>
      )}
    </div>
  );
}