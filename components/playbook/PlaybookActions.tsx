// components/playbook/PlaybookActions.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type PlaybookActionsProps = {
  creatingProject: boolean;
  onCreateProject: () => void;
  onCreateNew: () => void;
};

// === [2] COMPONENT ROOT ===
export default function PlaybookActions({
  creatingProject,
  onCreateProject,
  onCreateNew,
}: PlaybookActionsProps) {
  // === [2.1] PRINT HANDLER ===
  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <section className="flex flex-col md:flex-row justify-between mt-4 gap-3 md:items-center">
      {/* === [2.2] LEFT BUTTONS === */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
        >
          Print / Save as PDF
        </button>

        <button
          type="button"
          onClick={onCreateNew}
          className="px-5 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
        >
          Create another playbook
        </button>
      </div>

      {/* === [2.3] RIGHT BUTTON === */}
      <button
        type="button"
        onClick={onCreateProject}
        disabled={creatingProject}
        className="px-6 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-60"
      >
        {creatingProject ? 'Creating project…' : 'Create project from this playbook'}
      </button>
    </section>
  );
}