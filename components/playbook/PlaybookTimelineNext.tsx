// components/playbook/PlaybookTimelineNext.tsx

'use client';

import React, { useState, useEffect } from 'react';

// === [1] TYPES ===
type PlaybookTimelineNextProps = {
  free: any;
  onUpdateTimeline: (timeline: string[]) => void;
  onUpdateNextSteps: (steps: string[]) => void;
};

// === [2] HELPERS ===
function arrayToLines(arr: string | string[] | undefined): string {
  if (Array.isArray(arr)) return arr.join('\n');
  if (typeof arr === 'string') return arr;    
  return '';
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function ensureArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return linesToArray(value);
  return [];
}

// === [3] COMPONENT ROOT ===
export default function PlaybookTimelineNext({
  free,
  onUpdateTimeline,
  onUpdateNextSteps,
}: PlaybookTimelineNextProps) {

  // Convert free.timeline & free.nextSteps into guaranteed arrays
  const timeline = ensureArray(free?.timeline);
  const nextSteps = ensureArray(free?.nextSteps);

  const [editTimeline, setEditTimeline] = useState(false);
  const [editNext, setEditNext] = useState(false);

  const [draftTimeline, setDraftTimeline] = useState(arrayToLines(timeline));
  const [draftNext, setDraftNext] = useState(arrayToLines(nextSteps));

  useEffect(() => {
    if (!editTimeline) setDraftTimeline(arrayToLines(timeline));
  }, [timeline, editTimeline]);

  useEffect(() => {
    if (!editNext) setDraftNext(arrayToLines(nextSteps));
  }, [nextSteps, editNext]);

  function saveTimeline() {
    onUpdateTimeline(linesToArray(draftTimeline));
    setEditTimeline(false);
  }

  function cancelTimeline() {
    setDraftTimeline(arrayToLines(timeline));
    setEditTimeline(false);
  }

  function saveNextSteps() {
    onUpdateNextSteps(linesToArray(draftNext));
    setEditNext(false);
  }

  function cancelNextSteps() {
    setDraftNext(arrayToLines(nextSteps));
    setEditNext(false);
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">

      {/* === TIMELINE CARD === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            ⏱ High-level timeline
          </h2>
          <button
            type="button"
            onClick={() => setEditTimeline(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>

        {!editTimeline ? (
          timeline.length ? (
            <div className="relative pl-4">
              <div className="absolute left-1 top-1 bottom-1 w-px bg-slate-200" />
              <ul className="space-y-3 text-sm text-slate-700">
                {timeline.map((step: string, idx: number) => (
                  <li key={idx} className="relative flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 inline-block" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No timeline has been generated yet.
            </p>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftTimeline}
              onChange={(e) => setDraftTimeline(e.target.value)}
              placeholder={'One step per line, e.g.\nMarket research – 2 months\nPrototype & sampling – 3 months\nFirst production – 2 months'}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelTimeline}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTimeline}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === NEXT STEPS CARD === */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            ✅ Suggested next steps
          </h2>
          <button
            type="button"
            onClick={() => setEditNext(true)}
            className="text-xs text-slate-500 hover:text-slate-800 mt-1"
          >
            ✏️ Edit
          </button>
        </div>

        {!editNext ? (
          nextSteps.length ? (
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              {nextSteps.map((step: string, idx: number) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-600">
              No next steps have been suggested yet.
            </p>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              value={draftNext}
              onChange={(e) => setDraftNext(e.target.value)}
              placeholder={'One step per line, e.g.\nConfirm target customer segment\nDecide on final feature set\nRequest quotes from 3 suppliers'}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelNextSteps}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNextSteps}
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