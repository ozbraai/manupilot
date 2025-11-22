'use client';

// === [0] IMPORTS ===
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

import ProjectHeader from '../../../components/project/ProjectHeader';
import ProjectKeyInfo from '../../../components/project/ProjectKeyInfo';
import ProjectMaterials from '../../../components/project/ProjectMaterials';
import ProjectFeatures from '../../../components/project/ProjectFeatures';
import ProjectApproach from '../../../components/project/ProjectApproach';
import ProjectRisks from '../../../components/project/ProjectRisks';
import ProjectTimeline from '../../../components/project/ProjectTimeline';
import ProjectNextSteps from '../../../components/project/ProjectNextSteps';
import ProjectNotes from '../../../components/project/ProjectNotes';
import ProjectActivity from '../../../components/project/ProjectActivity';
import ProjectPlaybookModal from '../../../components/project/ProjectPlaybookModal';

// === [1] TYPES ===
type Project = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

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

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [playbook, setPlaybook] = useState<any | null>(null);
  const [completion, setCompletion] = useState<CompletionState>({});
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showPlaybook, setShowPlaybook] = useState(false);

  // === [2] LOAD PROJECT + LOCAL DATA ONCE ===
  useEffect(() => {
    async function load() {
      try {
        if (!projectId) return;

        setLoading(true);
        setError(null);

        // Project from Supabase
        const { data, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        const hasRealError =
          projectError &&
          typeof projectError === 'object' &&
          Object.keys(projectError).length > 0;

        if (hasRealError) {
          // Real Supabase error
          console.error('Project load error:', projectError);
          setError('Could not load project.');
          setLoading(false);
          return;
        }

        if (!data && !hasRealError) {
          // No row found – treat as “not found” instead of throwing
          setError('Project not found. It may not have been saved yet.');
          setLoading(false);
          return;
        }

        setProject(data as Project);

        // Client-side only: playbook + local state
        if (typeof window !== 'undefined') {
          const pbRaw = window.localStorage.getItem(
            `manupilot_playbook_project_${projectId}`
          );
          const compRaw = window.localStorage.getItem(
            `manupilot_project_${projectId}_roadmap`
          );
          const catRaw = window.localStorage.getItem(
            `manupilot_project_${projectId}_category`
          );
          const notesRaw = window.localStorage.getItem(
            `manupilot_project_${projectId}_notes`
          );
          const activityRaw = window.localStorage.getItem(
            `manupilot_project_${projectId}_activity`
          );

          if (pbRaw) {
            try {
              const parsed = JSON.parse(pbRaw);
              setPlaybook(parsed);
            } catch (e) {
              console.error('Playbook parse error:', e);
            }
          }

          if (compRaw) {
            try {
              const parsed = JSON.parse(compRaw);
              setCompletion(parsed);
            } catch (e) {
              console.error('Completion parse error:', e);
            }
          }

          if (catRaw) setCategory(catRaw);
          if (notesRaw) setNotes(notesRaw);

          if (activityRaw) {
            try {
              const parsed = JSON.parse(activityRaw);
              setActivity(parsed);
            } catch (e) {
              console.error('Activity parse error:', e);
            }
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Unexpected project load error:', err);
        setError('Unexpected error while loading project.');
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  // === [3] COMPUTE PROGRESS WHEN COMPLETION/PLAYBOOK CHANGE ===
  useEffect(() => {
    if (!playbook?.free?.roadmapPhases) {
      setProgress(0);
      return;
    }

    try {
      const phases = playbook.free.roadmapPhases;
      let total = 0;
      let done = 0;

      phases.forEach((phase: any, pIndex: number) => {
        const phaseId = phase.id || `phase_${pIndex}`;
        const tasks = phase.tasks || [];
        tasks.forEach((task: any, tIndex: number) => {
          const taskId = task.id || `task_${tIndex}`;
          total += 1;
          if (completion?.[phaseId]?.[taskId]) {
            done += 1;
          }
        });
      });

      if (!total) {
        setProgress(0);
      } else {
        setProgress(Math.round((done / total) * 100));
      }
    } catch (e) {
      console.error('Completion compute error:', e);
      setProgress(0);
    }
  }, [completion, playbook]);

  // === [4] HANDLERS ===
  function handleToggleTask(phaseId: string, taskId: string, value: boolean) {
    setCompletion((prev) => {
      const updated: CompletionState = {
        ...prev,
        [phaseId]: {
          ...(prev[phaseId] || {}),
          [taskId]: value,
        },
      };

      if (typeof window !== 'undefined' && projectId) {
        window.localStorage.setItem(
          `manupilot_project_${projectId}_roadmap`,
          JSON.stringify(updated)
        );
      }

      return updated;
    });
  }

  function handleUpdateNotes(text: string) {
    setNotes(text);
    if (typeof window !== 'undefined' && projectId) {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_notes`,
        text
      );
    }
  }

  function handleUpdateActivity(items: ActivityItem[]) {
    setActivity(items);
    if (typeof window !== 'undefined' && projectId) {
      window.localStorage.setItem(
        `manupilot_project_${projectId}_activity`,
        JSON.stringify(items)
      );
    }
  }

  // Derived convenience
  const free = playbook?.free || {};
  const keyInfo = {
    category: category || playbook?.category || 'General product',
    sourcingMode: playbook?.sourcingMode || 'custom',
    createdAt: project?.created_at,
  };

  // === [5] RENDER ===
  if (loading && !project) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-sm text-slate-600">Loading project…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-sm text-slate-600">
          Project not found or not available.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <ProjectHeader
        project={project}
        progress={progress}
        category={keyInfo.category}
        sourcingMode={keyInfo.sourcingMode}
        onShowPlaybook={() => setShowPlaybook(true)}
      />

      <ProjectKeyInfo project={project} keyInfo={keyInfo} />

      <section className="grid gap-6 md:grid-cols-2">
        <ProjectMaterials materials={free.materials} />
        <ProjectFeatures features={free.features} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ProjectApproach approach={free.approach} />
        <ProjectRisks risks={free.risks} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ProjectTimeline timeline={free.timeline} />
        <ProjectNextSteps nextSteps={free.nextSteps} />
      </section>

      <ProjectNotes notes={notes} onUpdate={handleUpdateNotes} />

      <ProjectActivity
        completion={completion}
        onToggleTask={handleToggleTask}
        projectId={projectId}
        activity={activity}
        setActivity={handleUpdateActivity}
      />

      <ProjectPlaybookModal
        show={showPlaybook}
        setShow={setShowPlaybook}
        free={free}
        project={project}
      />
    </main>
  );
}