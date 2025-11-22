// components/project/ProjectTimeline.tsx

'use client';

import React from 'react';

type ProjectTimelineProps = {
  // Can now be a string (from AI), string[] or undefined
  timeline: string | string[] | undefined;
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

export default function ProjectTimeline({ timeline }: ProjectTimelineProps) {
  const items = ensureArray(timeline);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">
        High-level timeline
      </h3>

      {items.length ? (
        <div className="relative pl-4">
          <div className="absolute left-1 top-1 bottom-1 w-px bg-slate-200" />
          <ul className="space-y-3 text-sm text-slate-700">
            {items.map((step, idx) => (
              <li key={idx} className="relative flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 inline-block" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          No timeline has been defined for this project yet.
        </p>
      )}
    </div>
  );
}