// components/playbook/PlaybookHeader.tsx

'use client';

import React, { useState } from 'react';

// === [1] TYPES ===
type PlaybookHeaderProps = {
  productName: string;
  summary: string;
  onUpdateSummary: (value: string) => void;
};

// === [2] COMPONENT ROOT ===
export default function PlaybookHeader({
  productName,
  summary,
  onUpdateSummary,
}: PlaybookHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(summary);

  // Sync when summary changes externally
  React.useEffect(() => {
    if (!isEditing) setDraft(summary);
  }, [summary, isEditing]);

  function handleSave() {
    onUpdateSummary(draft.trim());
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(summary);
    setIsEditing(false);
  }

  return (
    <section className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      {/* === [2.1] TITLE BAR === */}
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
        Manufacturing Playbook
      </p>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          {productName || 'Untitled product'}
        </h1>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          ✏️ Edit summary
        </button>
      </div>

      {/* === [2.2] SUMMARY === */}
      {!isEditing ? (
        <p className="mt-3 text-slate-700 text-base md:text-lg">
          {summary || 'No summary available.'}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </section>
  );
}