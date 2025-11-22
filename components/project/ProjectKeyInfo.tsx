// components/project/ProjectKeyInfo.tsx

'use client';

import React, { useState, useEffect } from 'react';

type ProjectKeyInfoProps = {
  project: any;
  keyInfo: {
    category: string;
    sourcingMode: string;
    createdAt?: string;
  };
  free?: any;
};

export default function ProjectKeyInfo({ project, keyInfo, free = {} }: ProjectKeyInfoProps) {
  // Defensive: safely extract fields even if missing
  const safeCustomer =
    free.targetCustomer ||
    free.customer ||
    free.targetMarket ||
    '';

  const safeSummary = free.summary || '';
  const safeCategory = keyInfo.category || 'General product';
  const safeSourcing = keyInfo.sourcingMode || 'custom';

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState(safeCustomer);

  useEffect(() => {
    setDraftCustomer(
      free.targetCustomer ||
        free.customer ||
        free.targetMarket ||
        ''
    );
  }, [free]);

  function saveCustomer() {
    if (typeof window !== 'undefined') {
      const updated = { ...free, targetCustomer: draftCustomer };

      window.localStorage.setItem(
        `manupilot_playbook_project_${project.id}`,
        JSON.stringify({ free: updated })
      );
    }
    setEditingCustomer(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
          Summary
        </p>
        <p className="text-sm text-slate-700 whitespace-pre-line">
          {safeSummary || 'No summary available.'}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
          Product category
        </p>
        <p className="text-sm text-slate-700">{safeCategory}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
          Sourcing mode
        </p>
        <p className="text-sm text-slate-700">
          {safeSourcing === 'white-label'
            ? 'White label / private label'
            : 'Custom product'}
        </p>
      </div>

      {/* TARGET CUSTOMER */}
      <div>
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
            Target customer
          </p>
          {!editingCustomer && (
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800"
              onClick={() => setEditingCustomer(true)}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {!editingCustomer ? (
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {safeCustomer || 'No customer information yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftCustomer}
              onChange={(e) => setDraftCustomer(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700"
                onClick={() => {
                  setDraftCustomer(safeCustomer);
                  setEditingCustomer(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
                onClick={saveCustomer}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}