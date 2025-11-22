// components/project/ProjectNotes.tsx

'use client';

import React, { useState, useEffect } from 'react';

type ProjectNotesProps = {
  notes: string | undefined;
  onUpdate: (text: string) => void;
};

export default function ProjectNotes({ notes, onUpdate }: ProjectNotesProps) {
  const [draft, setDraft] = useState(notes || '');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(notes || '');
    }
  }, [notes, editing]);

  function handleSave() {
    onUpdate(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(notes || '');
    setEditing(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>

        {!editing && (
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-800"
            onClick={() => setEditing(true)}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {!editing ? (
        notes && notes.trim() ? (
          <p className="text-sm text-slate-700 whitespace-pre-line">{notes}</p>
        ) : (
          <p className="text-sm text-slate-500">
            No notes added yet. Click edit to add your first one.
          </p>
        )
      ) : (
        <div className="space-y-2">
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add notes about supplier calls, decisions, or anything important…"
          />
          <div className="flex justify-end gap-2">
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