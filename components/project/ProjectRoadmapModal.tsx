// components/project/ProjectRoadmapModal.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type CompletionState = {
  [phaseId: string]: {
    [taskId: string]: boolean;
  };
};

type ActivityEntry = {
  timestamp: string;
  message: string;
};

type ProjectRoadmapModalProps = {
  show: boolean;
  setShow: (open: boolean) => void;
  free: any | null | undefined;       // free section of playbook
  completion: CompletionState;
  setCompletion: (value: CompletionState) => void;
  projectId: string;
  activity: ActivityEntry[];
  setActivity: (fn: (prev: ActivityEntry[]) => ActivityEntry[]) => void;
};

// === [2] HELPERS ===
function addActivity(
  projectId: string,
  message: string,
  setActivity: (fn: (prev: ActivityEntry[]) => ActivityEntry[]) => void
) {
  const entry: ActivityEntry = {
    timestamp: new Date().toISOString(),
    message,
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
    const next: CompletionState = {
      ...completion,
      [phaseId]: {
        ...(completion[phaseId] || {}),
        [taskId]: !(completion[phaseId] && completion[phaseId][taskId]),
      },
    };

    const nowChecked = !(completion[phaseId] && completion[phaseId][taskId]);
    setCompletion(next);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_roadmap`,
        JSON.stringify(next)
      );
    }

    // Log activity
    addActivity(
      projectId,
      `${nowChecked ? 'Completed' : 'Unchecked'} task: "${label}"`,
      setActivity
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* === [3.2] HEADER === */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Roadmap & checklist
          </h2>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Close ✕
          </button>
        </div>

        {/* === [3.3] BODY === */}
        <div className="px-6 py-4 overflow-y-auto max-h-[70vh] space-y-4 text-sm">
          {!phases.length ? (
            <p className="text-slate-600">
              This project does not have a roadmap yet. Generate a new playbook or update this project to include roadmap phases.
            </p>
          ) : (
            phases.map((phase: any, phaseIdx: number) => {
              const phaseId =
                phase.id || phase.name || `phase_${phaseIdx}`;
              const tasks = phase.tasks || [];

              return (
                <div
                  key={phaseId}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  {/* === [3.3.1] PHASE HEADER === */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900">
                      {phase.name || `Phase ${phaseIdx + 1}`}
                    </h3>
                  </div>
                  {phase.description && (
                    <p className="text-xs text-slate-500 mb-2">
                      {phase.description}
                    </p>
                  )}

                  {/* === [3.3.2] TASK LIST === */}
                  <div className="space-y-1">
                    {tasks.map((task: string, taskIdx: number) => {
                      const taskKey = `${phaseId}_task_${taskIdx}`;
                      const checked =
                        completion?.[phaseId]?.[taskKey] || false;

                      return (
                        <label
                          key={taskKey}
                          className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            checked={checked}
                            onChange={() =>
                              toggleTask(phaseId, taskKey, task)
                            }
                          />
                          <span>{task}</span>
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