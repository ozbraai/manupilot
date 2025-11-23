'use client';

import React from 'react';

// === [1] TYPES ===
type CompletionState = {
  [phaseId: string]: {
    [taskId: string]: boolean;
  };
};

// We update this type to match what ProjectActivity.tsx expects
type ActivityItem = {
  id: string;
  type: 'note' | 'decision' | 'update';
  title: string;
  detail: string;
  createdAt: string;
};

type ProjectRoadmapModalProps = {
  show: boolean;
  setShow: (open: boolean) => void;
  free: any | null | undefined;
  completion: CompletionState;
  setCompletion: (value: CompletionState) => void;
  projectId: string;
  // Update prop type to match
  activity: ActivityItem[];
  setActivity: (fn: (prev: ActivityItem[]) => ActivityItem[]) => void;
};

// === [2] HELPERS ===
function addActivity(
  projectId: string,
  message: string,
  setActivity: (fn: (prev: ActivityItem[]) => ActivityItem[]) => void
) {
  // Create a robust, unique item that matches the Activity Log's expectations
  const entry: ActivityItem = {
    id: `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
    type: 'update',
    title: 'Roadmap',
    detail: message,
    createdAt: new Date().toISOString(),
  };

  setActivity((prev) => {
    const next = [entry, ...prev];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_activity`,
        JSON.stringify(next)
      );
    }
    return next;
  });
}

// === [3] COMPONENT ROOT ===
export default function ProjectRoadmapModal({
  show,
  setShow,
  free,
  completion,
  setCompletion,
  projectId,
  setActivity,
}: ProjectRoadmapModalProps) {
  if (!show) return null;

  const phases = free?.roadmapPhases || [];

  // === [3.1] TOGGLE TASK ===
  function toggleTask(
    phaseId: string,
    taskId: string,
    label: string
  ) {
    const currentPhase = completion[phaseId] || {};
    const isCurrentlyDone = !!currentPhase[taskId];
    const nextValue = !isCurrentlyDone;

    const next: CompletionState = {
      ...completion,
      [phaseId]: {
        ...currentPhase,
        [taskId]: nextValue,
      },
    };

    setCompletion(next);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_roadmap`,
        JSON.stringify(next)
      );
    }

    // Log activity with the fixed structure
    addActivity(
      projectId,
      `${nextValue ? 'Completed' : 'Unchecked'} task: "${label}"`,
      setActivity
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
        {/* === HEADER === */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">
            Roadmap & Checklist
          </h2>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition"
          >
            Close ✕
          </button>
        </div>

        {/* === BODY === */}
        <div className="px-6 py-4 overflow-y-auto max-h-[70vh] space-y-6 bg-white">
          {!phases.length ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <p className="text-sm text-slate-600">
                This project does not have a roadmap generated yet.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try creating a new playbook to get the full AI roadmap features.
              </p>
            </div>
          ) : (
            phases.map((phase: any, phaseIdx: number) => {
              const phaseId = phase.id || phase.name || `phase_${phaseIdx}`;
              const tasks = phase.tasks || [];

              // Calculate phase progress
              const phaseTasksCount = tasks.length;
              const phaseCompletedCount = tasks.reduce((acc: number, _: string, idx: number) => {
                const tId = `${phaseId}_task_${idx}`;
                return acc + (completion?.[phaseId]?.[tId] ? 1 : 0);
              }, 0);
              const isPhaseComplete = phaseTasksCount > 0 && phaseTasksCount === phaseCompletedCount;

              return (
                <div
                  key={phaseId}
                  className={`border rounded-xl p-4 transition-all ${
                    isPhaseComplete 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-sm font-semibold ${isPhaseComplete ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {phase.name || `Phase ${phaseIdx + 1}`}
                      </h3>
                      {phase.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {phase.description}
                        </p>
                      )}
                    </div>
                    {isPhaseComplete && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        Phase Complete
                      </span>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {tasks.map((task: string, taskIdx: number) => {
                      const taskKey = `${phaseId}_task_${taskIdx}`;
                      const checked = completion?.[phaseId]?.[taskKey] || false;

                      return (
                        <label
                          key={taskKey}
                          className={`flex items-start gap-3 text-sm p-2 rounded-lg cursor-pointer transition-colors ${
                            checked ? 'text-slate-400 bg-slate-50 line-through' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 shrink-0"
                            checked={checked}
                            onChange={() => toggleTask(phaseId, taskKey, task)}
                          />
                          <span className="leading-tight select-none">{task}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}