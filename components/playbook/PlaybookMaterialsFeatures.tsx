// components/playbook/PlaybookMaterialsFeatures.tsx

'use client';

import React, { useState, useEffect } from 'react';

// === [1] TYPES ===
type PlaybookMaterialsFeaturesProps = {
  free: any;
  onUpdateMaterials: (materials: string[]) => void;
  onUpdateFeatures: (features: string[]) => void;
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
export default function PlaybookMaterialsFeatures({
  free,
  onUpdateMaterials,
  onUpdateFeatures,
}: PlaybookMaterialsFeaturesProps) {
  const materials = free?.materials || [];
  const features = free?.keyFeatures || [];

  const [editMaterials, setEditMaterials] = useState(false);
  const [editFeatures, setEditFeatures] = useState(false);

  const [draftMaterials, setDraftMaterials] = useState(arrayToLines(materials));
  const [draftFeatures, setDraftFeatures] = useState(arrayToLines(features));

  useEffect(() => {
    if (!editMaterials) setDraftMaterials(arrayToLines(materials));
  }, [materials, editMaterials]);

  useEffect(() => {
    if (!editFeatures) setDraftFeatures(arrayToLines(features));
  }, [features, editFeatures]);

  function saveMaterials() {
    onUpdateMaterials(linesToArray(draftMaterials));
    setEditMaterials(false);
  }

  function cancelMaterials() {
    setDraftMaterials(arrayToLines(materials));
    setEditMaterials(false);
  }

  function saveFeatures() {
    onUpdateFeatures(linesToArray(draftFeatures));
    setEditFeatures(false);
  }

  function cancelFeatures() {
    setDraftFeatures(arrayToLines(features));
    setEditFeatures(false);
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {/* === [3.1] MATERIALS === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            🧱 Materials
          </h2>
          <button
            type="button"
            onClick={() => setEditMaterials(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>

        {!editMaterials ? (
          materials.length ? (
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {materials.map((m: string, idx: number) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No materials captured.</p>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftMaterials}
              onChange={(e) => setDraftMaterials(e.target.value)}
              placeholder={'One material per line, e.g.\n304 stainless steel\nAluminium frame'}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelMaterials}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMaterials}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === [3.2] KEY FEATURES === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            ⭐ Key features
          </h2>
          <button
            type="button"
            onClick={() => setEditFeatures(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>

        {!editFeatures ? (
          features.length ? (
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {features.map((f: string, idx: number) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No key features captured.</p>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftFeatures}
              onChange={(e) => setDraftFeatures(e.target.value)}
              placeholder={'One feature per line, e.g.\nCompact folding design\nHeat-resistant handle'}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelFeatures}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveFeatures}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
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