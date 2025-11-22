// components/project/ProjectActivity.tsx

'use client';

import React, { useState } from 'react';

type CompletionState = {
  [phaseId: string]: {
    [taskId: string]: boolean;
  };
};

type ActivityItem = {
  id: string;
  type: 'note' | 'decision' | 'update';
  title: string;
  detail: string;
  createdAt: string;
};

type ProjectActivityProps = {
  completion: CompletionState;
  onToggleTask: (phaseId: string, taskId: string, value: boolean) => void;
  projectId: string | undefined;
  activity: ActivityItem[];
  setActivity: (items: ActivityItem[]) => void;
};

export default function ProjectActivity({
  completion,
  onToggleTask,
  projectId,
  activity,
  setActivity,
}: ProjectActivityProps) {
  const [newNote, setNewNote] = useState('');

  // Very simple stats: how many tasks done vs total
  let totalTasks = 0;
  let doneTasks = 0;
  Object.values(completion).forEach((phaseTasks) => {
    Object.values(phaseTasks).forEach((done) => {
      totalTasks += 1;
      if (done) doneTasks += 1;
    });
  });

  const progress =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  function handleAddNote() {
    const text = newNote.trim();
    if (!text) return;

    const item: ActivityItem = {
      id: `${Date.now()}`,
      type: 'note',
      title: 'Note',
      detail: text,
      createdAt: new Date().toISOString(),
    };

    const updated = [item, ...activity];
    setActivity(updated);
    setNewNote('');

    if (typeof window !== 'undefined' && projectId) {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_activity`,
        JSON.stringify(updated)
      );
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Activity & progress
        </h3>
        <span className="text-xs text-slate-500">
          {doneTasks}/{totalTasks || 0} tasks complete ({progress}%)
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Quick note box */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">
          Add a quick note
        </label>
        <textarea
          className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Example: Spoke to supplier A, they can do smaller MOQ with slightly higher cost."
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddNote}
            className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50"
            disabled={!newNote.trim()}
          >
            Save note
          </button>
        </div>
      </div>

      {/* Activity list */}
      <div className="border-t border-slate-100 pt-3">
        <p className="text-xs font-medium text-slate-700 mb-2">Recent activity</p>
        {activity.length ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {activity.map((item) => (
              <li key={item.id} className="border border-slate-100 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-slate-800">{item.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            No activity logged yet. Use the note field above to start tracking key
            decisions and updates.
          </p>
        )}
      </div>
    </section>
  );
}