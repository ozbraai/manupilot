'use client';

// === [0] IMPORTS ===
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectKeyInfo from '@/components/project/ProjectKeyInfo';
import ProjectMaterials from '@/components/project/ProjectMaterials';
import ProjectFeatures from '@/components/project/ProjectFeatures';
import ProjectApproach from '@/components/project/ProjectApproach';
import ProjectRisks from '@/components/project/ProjectRisks';
import ProjectTimeline from '@/components/project/ProjectTimeline';
import ProjectNextSteps from '@/components/project/ProjectNextSteps';
import ProjectNotes from '@/components/project/ProjectNotes';
import ProjectActivityLog from '@/components/project/ProjectActivityLog';
import ProjectPremiumCTA from '@/components/project/ProjectPremiumCTA';
import ProjectRoadmapModal from '@/components/project/ProjectRoadmapModal';
import ProjectPlaybookModal from '@/components/project/ProjectPlaybookModal';
import ProjectComponents from '@/components/project/ProjectComponents';

type CompletionState = {
  [phaseId: string]: { [taskId: string]: boolean };
};

type ActivityEntry = {
  timestamp: string;
  message: string;
};

// Very light types to avoid type battles
type Project = any;
type Playbook = any;

// === [1] PAGE COMPONENT ===
export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);

  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState('General');
  const [completion, setCompletion] = useState<CompletionState>({});
  const [notes, setNotes] = useState('');
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [includePremium, setIncludePremium] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (projectError) {
          console.error('Project load error:', projectError);
          setError('Could not load project.');
          setLoading(false);
          return;
        }

        setProject(data);

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
          const actRaw = window.localStorage.getItem(
            `manupilot_project_${projectId}_activity`
          );
          const premiumFlag = window.localStorage.getItem(
            'manupilot_include_premium'
          );

          if (pbRaw) {
            try {
              setPlaybook(JSON.parse(pbRaw));
            } catch (e) {
              console.error('Playbook parse error:', e);
            }
          }

          if (compRaw) {
            try {
              setCompletion(JSON.parse(compRaw));
            } catch (e) {
              console.error('Completion parse error:', e);
            }
          }

          if (catRaw) setCategory(catRaw);
          if (notesRaw) setNotes(notesRaw);
          if (actRaw) {
            try {
              setActivity(JSON.parse(actRaw));
            } catch (e) {
              console.error('Activity parse error:', e);
            }
          }
          if (premiumFlag === 'true') setIncludePremium(true);
        }

        setLoading(false);
      } catch (e: any) {
        console.error('Project page load error:', e);
        setError('Something went wrong loading this project.');
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
        const phaseId = phase.id || phase.name || `phase_${pIndex}`;
        (phase.tasks || []).forEach((_: any, tIndex: number) => {
          total++;
          const taskId = `${phaseId}_task_${tIndex}`;
          if (completion?.[phaseId]?.[taskId]) done++;
        });
      });

      setProgress(total ? Math.round((done / total) * 100) : 0);
    } catch (e) {
      console.error('Progress compute error:', e);
      setProgress(0);
    }
  }, [completion, playbook]);

  // === [4] LOADING / ERROR STATES ===
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading project…</p>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{error || 'Project not found.'}</p>
      </main>
    );
  }

  const free = playbook?.free;

  // === [5] PAGE LAYOUT ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto pt-12 px-4 md:px-0 space-y-8">

        {/* [5.1] HEADER */}
        <ProjectHeader
          project={project}
          category={category}
          progress={progress}
          setShowRoadmap={setShowRoadmap}
          setShowPlaybook={setShowPlaybook}
        />

        {/* [5.2] COMPONENTS & SUPPLIERS */}
        {free && <ProjectComponents free={free} />}

        {/* [5.3] KEY INFO */}
        {free && <ProjectKeyInfo free={free} />}

        {/* [5.3] MATERIALS & FEATURES (grouped like components) */}
        {free && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
            <ProjectMaterials free={free} />
            <ProjectFeatures free={free} />
           </div>
          </section>
        )}

        {/* [5.4] MANUFACTURING APPROACH & RISKS (grouped) */}
        {free && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1.7fr_1.3fr]">
             <ProjectApproach free={free} />
             <ProjectRisks free={free} />
         </div>
          </section>
        )}

        {/* [5.5] TIMELINE & NEXT STEPS (grouped) */}
        {free && (
         <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1.5fr]">
            <ProjectTimeline free={free} />
            <ProjectNextSteps free={free} />
         </div>
        </section>
    )}

        {/* [5.7] NOTES & ACTIVITY LOG */}
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <ProjectNotes
            projectId={projectId}
            notes={notes}
            setNotes={setNotes}
            setActivity={setActivity}
          />
          <ProjectActivityLog activity={activity} />
        </div>

        {/* [5.8] PREMIUM CTA (toggle-controlled) */}
        {includePremium && <ProjectPremiumCTA />}
      </div>

      {/* [5.9] MODALS */}
      <ProjectRoadmapModal
        show={showRoadmap}
        setShow={setShowRoadmap}
        free={free}
        completion={completion}
        setCompletion={setCompletion}
        projectId={projectId}
        activity={activity}
        setActivity={setActivity}
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