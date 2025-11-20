// components/playbook/PlaybookApproachRisks.tsx

'use client';

import React, { useState, useEffect } from 'react';

// === [1] TYPES ===
type PlaybookApproachRisksProps = {
  free: any;
  onUpdateApproach: (rationale: string) => void;
  onUpdateRisks: (risks: string[]) => void;
};

// === [2] HELPERS ===
function arrayToLines(arr: string[]) {
  return (arr || []).join('\n');
}

function linesToArray(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// === [3] COMPONENT ROOT ===
export default function PlaybookApproachRisks({
  free,
  onUpdateApproach,
  onUpdateRisks,
}: PlaybookApproachRisksProps) {
  const rationale = free?.manufacturingApproach?.rationale || '';
  const risks = free?.manufacturingApproach?.risks || [];

  const [editApproach, setEditApproach] = useState(false);
  const [editRisks, setEditRisks] = useState(false);

  const [draftApproach, setDraftApproach] = useState(rationale);
  const [draftRisks, setDraftRisks] = useState(arrayToLines(risks));

  useEffect(() => {
    if (!editApproach) setDraftApproach(rationale);
  }, [rationale, editApproach]);

  useEffect(() => {
    if (!editRisks) setDraftRisks(arrayToLines(risks));
  }, [risks, editRisks]);

  function saveApproach() {
    onUpdateApproach(draftApproach.trim());
    setEditApproach(false);
  }

  function cancelApproach() {
    setDraftApproach(rationale);
    setEditApproach(false);
  }

  function saveRisks() {
    onUpdateRisks(linesToArray(draftRisks));
    setEditRisks(false);
  }

  function cancelRisks() {
    setDraftRisks(arrayToLines(risks));
    setEditRisks(false);
  }

  return (
    <section className="grid gap-6 md:grid-cols-[1.7fr_1.3fr]">
      {/* === [3.1] APPROACH === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            ⚙️ Manufacturing approach
          </h2>
          <button
            type="button"
            onClick={() => setEditApproach(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>
        {!editApproach ? (
          <p className="text-sm text-slate-700">
            {rationale || 'No detailed manufacturing rationale has been generated yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftApproach}
              onChange={(e) => setDraftApproach(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelApproach}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveApproach}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === [3.2] RISKS === */}
      {true && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              ⚠️ Risks to watch
            </h2>
            <button
              type="button"
              onClick={() => setEditRisks(true)}
              className="text-xs text-amber-700 hover:text-amber-900 mt-1"
            >
              ✏️ Edit
            </button>
          </div>
          {!editRisks ? (
            risks.length ? (
              <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                {risks.map((risk: string, idx: number) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-amber-800">
                No risks captured. It may still be worth thinking about quality, safety and shipping risks.
              </p>
            )
          ) : (
            <div className="space-y-2">
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                value={draftRisks}
                onChange={(e) => setDraftRisks(e.target.value)}
                placeholder={'One risk per line, e.g.\nHeat distortion of metal frame\nMotor overheating in enclosed housing'}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={cancelRisks}
                  className="px-3 py-1.5 rounded-full border border-amber-200 text-xs text-amber-800 hover:bg-amber-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveRisks}
                  className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-900 text-xs font-medium hover:bg-amber-400"
                >
                  Save
                </button>
              </div>
            </div>
          )}
          <p className="text-[11px] text-amber-700">
            Use this to plan QC checks, sampling, and mitigation with suppliers.
          </p>
        </div>
      )}
    </section>
  );
}