// components/project/ProjectHeader.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectHeaderProps = {
  project: any;
  category: string;
  progress: number;
  // make these optional – they might not always be passed from the page
  setShowRoadmap?: (open: boolean) => void;
  setShowPlaybook?: (open: boolean) => void;
};

// === [2] HELPERS ===
function statusLabel(progress: number) {
  if (progress === 100) return 'Completed';
  if (progress === 0) return 'Not started';
  return 'In progress';
}

// === [3] COMPONENT ROOT ===
export default function ProjectHeader({
  project,
  category,
  progress,
  setShowRoadmap,
  setShowPlaybook,
}: ProjectHeaderProps) {
  const createdDate = project?.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : '';

  return (
    // === [3.1] HEADER WRAPPER ===
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* === [3.2] LEFT: TITLE + META === */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
            Project
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {project?.title || 'Untitled project'}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
              {category}
            </span>
            {createdDate && <span>Created {createdDate}</span>}
            <span>Status: {statusLabel(progress)}</span>
          </div>

          {project?.description && (
            <p className="mt-3 text-sm text-slate-700 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        {/* === [3.3] RIGHT: PROGRESS + ACTIONS === */}
        <div className="min-w-[220px] space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
              Roadmap progress
            </p>
            <p className="text-2xl font-semibold text-slate-900 mb-1">
              {progress}%
            </p>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-2 bg-sky-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Based on tasks completed in your ManuPilot roadmap.
            </p>
          </div>

          {/* === [3.4] ACTION BUTTONS === */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowRoadmap && setShowRoadmap(true)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-full border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={!setShowRoadmap}
            >
              ✅ Roadmap & checklist
            </button>
            <button
              type="button"
              onClick={() => setShowPlaybook && setShowPlaybook(true)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-full border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={!setShowPlaybook}
            >
              📄 View full playbook
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}