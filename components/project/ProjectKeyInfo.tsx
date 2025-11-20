// components/project/ProjectKeyInfo.tsx

'use client';

import React, { useState, useEffect } from 'react';

type ProjectKeyInfoProps = {
  free: any;
  onUpdateTargetCustomer?: (value: string) => void; // keep optional for future
};

// === [1] HELPERS ===
function EditableTextArea({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// === [2] COMPONENT ROOT ===
export default function ProjectKeyInfo({
  free,
  onUpdateTargetCustomer,
}: ProjectKeyInfoProps) {
  const regions = free?.manufacturingApproach?.recommendedRegions || [];
  const pricing = free?.pricing || {};
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState(
    free.targetCustomer || ''
  );

  useEffect(() => {
    if (!editingCustomer) setDraftCustomer(free.targetCustomer || '');
  }, [free.targetCustomer, editingCustomer]);

  function saveCustomer() {
    if (onUpdateTargetCustomer) {
      onUpdateTargetCustomer(draftCustomer.trim());
    }
    setEditingCustomer(false);
  }

  function cancelCustomer() {
    setDraftCustomer(free.targetCustomer || '');
    setEditingCustomer(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Target customer */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              👤 Target customer
            </h2>
            {onUpdateTargetCustomer && (
              <button
                type="button"
                onClick={() => setEditingCustomer(true)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          {!editingCustomer ? (
            <p className="text-sm text-slate-700">
              {free.targetCustomer || 'Not specified yet.'}
            </p>
          ) : (
            <EditableTextArea
              value={draftCustomer}
              onChange={setDraftCustomer}
              onSave={saveCustomer}
              onCancel={cancelCustomer}
            />
          )}
        </div>

        {/* Regions */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 mb-1">
            🌍 Manufacturing regions
          </h2>
          <p className="text-sm text-slate-700">
            {regions.length ? regions.join(', ') : 'Not specified'}
          </p>
        </div>

        {/* Pricing */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 mb-1">
            💰 Pricing & positioning
          </h2>
          <p className="text-sm text-slate-700 font-medium">
            {pricing.positioning || 'Not defined yet.'}
          </p>
          {pricing.insight && (
            <p className="mt-1 text-[11px] text-slate-500">
              {pricing.insight}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}