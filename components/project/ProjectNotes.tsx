// components/project/ProjectNotes.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectNotesProps = {
  projectId: string;
  notes: string;
  setNotes: (value: string) => void;
  setActivity: (fn: (prev: any[]) => any[]) => void;
};

// === [2] HELPERS ===
function addActivityEntry(
  projectId: string,
  message: string,
  setActivity: (fn: (prev: any[]) => any[]) => void
) {
  const entry = {
    timestamp: new Date().toISOString(),
    message,
  };

  setActivity((prev) => {
    const next = [entry, ...prev];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_activity`,
        JSON.stringify(next)
      );
    }
    return next;
  });
}

// === [3] COMPONENT ROOT ===
export default function ProjectNotes({
  projectId,
  notes,
  setNotes,
  setActivity,
}: ProjectNotesProps) {
  // === [3.1] ON CHANGE ===
  function handleChange(value: string) {
    setNotes(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_notes`,
        value
      );
    }
  }

  // === [3.2] ON BLUR (LOG ACTIVITY) ===
  function handleBlur() {
    if (notes.trim().length > 0) {
      addActivityEntry(
        projectId,
        'Updated project notes & decisions.',
        setActivity
      );
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* === [3.3] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        📝 Notes & decisions
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Capture key decisions, trade-offs and ideas. This is your private project log.
      </p>

      {/* === [3.4] TEXTAREA === */}
      <textarea
        className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
        placeholder="Example: Switched to stainless steel case for durability. Supplier A rejected due to MOQ. Waiting on second prototype from Supplier B..."
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
    </section>
  );
}