// components/project/ProjectActivityLog.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ActivityEntry = {
  timestamp: string;
  message: string;
};

type ProjectActivityLogProps = {
  activity: ActivityEntry[];
};

// === [2] COMPONENT ROOT ===
export default function ProjectActivityLog({
  activity,
}: ProjectActivityLogProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        📋 Activity log
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        A simple history of key actions you&apos;ve taken on this project inside ManuPilot.
      </p>

      {/* === [2.2] CONTENT === */}
      {activity.length === 0 ? (
        <p className="text-sm text-slate-600">
          No activities recorded yet. Completing tasks and updating notes will appear here.
        </p>
      ) : (
        <ul className="space-y-1 text-xs text-slate-700 max-h-48 overflow-y-auto">
          {activity.map((entry, idx) => (
            <li key={idx}>
              <span className="text-slate-400">
                {new Date(entry.timestamp).toLocaleString()} –{' '}
              </span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}