// components/playbook/PlaybookKeyInfo.tsx

'use client';

import React, { useState, useEffect } from 'react';

// === [1] TYPES ===
type PlaybookKeyInfoProps = {
  free: any;
  onUpdateTargetCustomer: (value: string) => void;
};

// === [2] COMPONENT ROOT ===
export default function PlaybookKeyInfo({
  free,
  onUpdateTargetCustomer,
}: PlaybookKeyInfoProps) {
  const regions = free?.manufacturingApproach?.recommendedRegions || [];
  const pricing = free?.pricing || {};
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState(free.targetCustomer || '');

  useEffect(() => {
    if (!editingCustomer) setDraftCustomer(free.targetCustomer || '');
  }, [free.targetCustomer, editingCustomer]);

  function saveCustomer() {
    onUpdateTargetCustomer(draftCustomer.trim());
    setEditingCustomer(false);
  }

  function cancelCustomer() {
    setDraftCustomer(free.targetCustomer || '');
    setEditingCustomer(false);
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {/* === [2.1] TARGET CUSTOMER (EDITABLE) === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            👤 Target customer
          </h2>
          <button
            type="button"
            onClick={() => setEditingCustomer(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>

        {!editingCustomer ? (
          <p className="text-sm text-slate-700">
            {free.targetCustomer || 'Not specified yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftCustomer}
              onChange={(e) => setDraftCustomer(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelCustomer}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomer}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === [2.2] REGIONS + PRICING (READ-ONLY FOR NOW) === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            🌍 Manufacturing regions
          </h2>
          <p className="text-sm text-slate-700">
            {regions.length ? regions.join(', ') : 'Not specified'}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            💰 Pricing & positioning
          </h2>
          <p className="text-sm text-slate-700 font-medium">
            {pricing.positioning || 'Not defined yet.'}
          </p>
          {pricing.insight && (
            <p className="mt-1 text-xs text-slate-500">
              {pricing.insight}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}