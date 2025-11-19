'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  title: string;
  description: string | null;
};

type Task = {
  id: string;
  label: string;
};

type Phase = {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
};

type CompletionState = {
  [phaseId: string]: {
    [taskId: string]: boolean;
  };
};

// Default roadmap if AI roadmap is not available
const DEFAULT_PHASES: Phase[] = [
  {
    id: 'idea-validation',
    name: '1. Idea & Validation',
    description:
      'Make sure the product solves a real problem and has a clear customer before spending serious money.',
    tasks: [
      { id: 'define-problem', label: 'Define the problem your product solves' },
      { id: 'identify-customer', label: 'Identify your ideal customer and use cases' },
      { id: 'research-competition', label: 'Research existing products and competitors' },
      { id: 'early-validation', label: 'Do basic validation (survey, pre-sell, or small test)' },
    ],
  },
  {
    id: 'manufacturing-prep',
    name: '2. Manufacturing Prep',
    description:
      'Turn your idea into a manufacturer-ready brief that factories and agents can understand.',
    tasks: [
      { id: 'dimensions-materials', label: 'Capture dimensions and key materials' },
      { id: 'generate-playbook', label: 'Generate a Manufacturing Playbook with ManuPilot' },
      { id: 'bom-outline', label: 'Outline a simple Bill of Materials (BOM)' },
      { id: 'risk-notes', label: 'Note any special risks (safety, food contact, baby use, etc.)' },
    ],
  },
  {
    id: 'supplier-outreach',
    name: '3. Supplier Outreach',
    description:
      'Start talking to factories or agents with clear expectations and safety in mind.',
    tasks: [
      { id: 'prepare-nda', label: 'Prepare or sign an NDA before sharing details' },
      { id: 'send-rfq', label: 'Send RFQs to multiple suppliers or agents' },
      { id: 'compare-quotes', label: 'Compare quotes, MOQs and lead times' },
      { id: 'select-partner', label: 'Select a preferred manufacturing partner or agent' },
    ],
  },
  {
    id: 'sampling-prototyping',
    name: '4. Sampling & Prototyping',
    description:
      'Test real samples before committing to large orders. Fix issues on paper, not in containers.',
    tasks: [
      { id: 'order-samples', label: 'Order initial samples or prototypes' },
      { id: 'evaluate-samples', label: 'Evaluate samples using a checklist (fit, finish, durability)' },
      { id: 'collect-feedback', label: 'Collect feedback from trusted users or customers' },
      { id: 'approve-for-production', label: 'Approve a final version for production' },
    ],
  },
  {
    id: 'production-shipping',
    name: '5. Production & Shipping',
    description:
      'Plan production, quality control and shipping so you aren’t surprised by delays or hidden costs.',
    tasks: [
      { id: 'final-po', label: 'Confirm final purchase order and payment terms' },
      { id: 'qc-plan', label: 'Create a QC (Quality Control) plan for pre/mid/post production' },
      { id: 'book-freight', label: 'Book freight (sea/air) and agree on shipping terms (Incoterms)' },
      { id: 'track-shipment', label: 'Track shipment and prepare for arrival (customs, warehousing)' },
    ],
  },
  {
    id: 'launch-beyond',
    name: '6. Launch & Beyond',
    description:
      'Launch with intention and make sure you have a plan for marketing, sales and future improvements.',
    tasks: [
      { id: 'launch-plan', label: 'Write a simple launch & marketing plan' },
      { id: 'content-assets', label: 'Prepare content assets (photos, video, product story)' },
      { id: 'sales-channels', label: 'Decide where you will sell (store, website, marketplaces)' },
      { id: 'feedback-loop', label: 'Set up a feedback loop for version 2 and future improvements' },
    ],
  },
];

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [playbook, setPlaybook] = useState<any | null>(null);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [completion, setCompletion] = useState<CompletionState>({});
  const [loading, setLoading] = useState(true);

  const storageKey = id ? `manupilot_project_${id}_roadmap` : '';

  // Load project from Supabase
  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      setProject(data as Project | null);
      setLoading(false);
    }

    loadProject();
  }, [id]);

  // Load AI playbook for this project
  useEffect(() => {
    if (!id || typeof window === 'undefined') return;

    const key = `manupilot_playbook_project_${id}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setPlaybook(parsed);

      // If AI roadmap exists, map it into our Phase[] structure
      const aiPhases = parsed?.free?.roadmapPhases;
      if (aiPhases && Array.isArray(aiPhases) && aiPhases.length > 0) {
        const mapped: Phase[] = aiPhases.map((p: any, phaseIdx: number) => ({
          id: p.id || `phase_${phaseIdx}`,
          name: p.name || `Phase ${phaseIdx + 1}`,
          description: p.description || '',
          tasks: (p.tasks || []).map((t: string, taskIdx: number) => ({
            id: `${p.id || `phase_${phaseIdx}`}_task_${taskIdx}`,
            label: t,
          })),
        }));
        setPhases(mapped);
      }
    } catch (e) {
      console.error('Failed to parse project playbook:', e);
    }
  }, [id]);

  // Load completion from localStorage
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CompletionState;
      setCompletion(parsed);
    } catch (e) {
      console.error('Failed to parse roadmap completion from localStorage', e);
    }
  }, [storageKey]);

  function persistCompletion(next: CompletionState) {
    setCompletion(next);
    if (typeof window !== 'undefined' && storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
  }

  function toggleTask(phaseId: string, taskId: string) {
    const next: CompletionState = {
      ...completion,
      [phaseId]: {
        ...(completion[phaseId] || {}),
        [taskId]: !(completion[phaseId] && completion[phaseId][taskId]),
      },
    };
    persistCompletion(next);
  }

  function getProgress() {
    let total = 0;
    let done = 0;

    for (const phase of phases) {
      for (const task of phase.tasks) {
        total += 1;
        if (completion[phase.id]?.[task.id]) {
          done += 1;
        }
      }
    }

    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading project…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Project not found.</p>
      </main>
    );
  }

  const progress = getProgress();

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto pt-12 px-4 md:px-0 space-y-10">
        {/* Project header */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
                Project
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-2 text-sm text-slate-600 max-w-xl">
                  {project.description}
                </p>
              )}
            </div>
            <div className="min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
                Roadmap progress
              </p>
              <p className="text-lg font-semibold text-slate-900 mb-1">
                {progress}% complete
              </p>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-2 bg-sky-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI Playbook summary (if available) */}
        {playbook && playbook.free && (
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              AI Manufacturing Playbook (summary)
            </h2>
            <p className="text-sm text-slate-700 mb-1">
              {playbook.free.summary}
            </p>
            <p className="text-xs text-slate-500">
              This roadmap is based on your Manufacturing Playbook for this product.
            </p>
          </section>
        )}

        {/* Phases */}
        <section className="space-y-6">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    {phase.name}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {phase.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {phase.tasks.map((task) => {
                  const checked = completion[phase.id]?.[task.id] || false;
                  return (
                    <label
                      key={task.id}
                      className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        checked={checked}
                        onChange={() => toggleTask(phase.id, task.id)}
                      />
                      <span>{task.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4 text-xs text-slate-500">
          <p>
            Over time, each phase can include recommended services, agents, manufacturers,
            marketing support and more — so you can move through your roadmap with help
            when you need it, and on your own when you don&apos;t.
          </p>
        </section>
      </div>
    </main>
  );
}