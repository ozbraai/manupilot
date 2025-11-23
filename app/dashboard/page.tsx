'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  FunnelIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// === [1] TYPES ===
type Project = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  status?: string | null;
};

type PlaybookDraft = {
  productName: string;
  free: {
    summary: string;
  };
};

type CompletionState = {
  [phaseId: string]: { [taskId: string]: boolean };
};

type StatusKey = 'all' | 'not-started' | 'in-progress' | 'completed';
type SortOption = 'newest' | 'oldest';

// === [2] STATUS HELPERS (BASED ON PROGRESS) ===
function getStatusLabelFromProgress(progress: number): string {
  if (progress >= 100) return 'Completed';
  if (progress > 0) return 'In progress';
  return 'Not started';
}

function getStatusColor(progress: number) {
  if (progress >= 100) return 'bg-emerald-500';
  if (progress > 0) return 'bg-sky-500';
  return 'bg-slate-300';
}

function getStatusKeyFromProgress(progress: number): StatusKey {
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'not-started';
}

// === [3] PAGE COMPONENT ===
export default function DashboardPage() {
  const router = useRouter();

  // Projects & draft
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftPlaybook, setDraftPlaybook] = useState<PlaybookDraft | null>(
    null
  );

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');

  // Derived per-project data
  const [projectCategories, setProjectCategories] = useState<
    Record<string, string>
  >({});
  const [projectProgress, setProjectProgress] = useState<
    Record<string, number>
  >({});

  // === [4] LOAD PROJECTS FROM SUPABASE ===
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error('Failed to load projects:', dbError);
          setError('Could not load projects.');
          setProjects([]);
          return;
        }

        setProjects((data || []) as Project[]);
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, []);

  // === [5] LOAD DRAFT PLAYBOOK FROM LOCALSTORAGE ===
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem('manupilotPlaybook');
    if (!raw) {
      setDraftPlaybook(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PlaybookDraft;
      setDraftPlaybook(parsed);
    } catch (e) {
      console.error('Failed to parse draft playbook:', e);
      setDraftPlaybook(null);
    }
  }, []);

  // === [6] LOAD CATEGORY & PROGRESS PER PROJECT ===
  useEffect(() => {
    if (typeof window === 'undefined' || projects.length === 0) return;

    const categories: Record<string, string> = {};
    const progressMap: Record<string, number> = {};

    projects.forEach((project) => {
      const id = project.id;

      // 6.1 Category
      const catKey = `manupilot_project_${id}_category`;
      const rawCat = window.localStorage.getItem(catKey);
      categories[id] = rawCat || 'Other';

      // 6.2 Progress (read from roadmap completion & playbook)
      try {
        const pbRaw = window.localStorage.getItem(
          `manupilot_playbook_project_${id}`
        );
        const compRaw = window.localStorage.getItem(
          `manupilot_project_${id}_roadmap`
        );

        if (!pbRaw || !compRaw) {
          progressMap[id] = 0;
          return;
        }

        const pb = JSON.parse(pbRaw);
        const completion = JSON.parse(compRaw) as CompletionState;
        const phases = pb?.free?.roadmapPhases || [];

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

        progressMap[id] = total ? Math.round((done / total) * 100) : 0;
      } catch (e) {
        console.error('Error computing project progress:', e);
        progressMap[id] = 0;
      }
    });

    setProjectCategories(categories);
    setProjectProgress(progressMap);
  }, [projects]);

  // === [7] STATS CALC ===
  const totalProjects = projects.length;

  const averageProgress = useMemo(() => {
    const values = Object.values(projectProgress);
    if (!values.length) return 0;
    const sum = values.reduce((acc, p) => acc + p, 0);
    return Math.round(sum / values.length);
  }, [projectProgress]);

  // === [8] FILTER + SORT PROJECTS FOR DISPLAY ===
  const filteredProjects = useMemo(() => {
    const bySearch = projects.filter((p) => {
      const text = (
        p.title +
        ' ' +
        (p.description || '')
      ).toLowerCase();
      return text.includes(search.toLowerCase());
    });

    const byStatus = bySearch.filter((p) => {
      const progress = projectProgress[p.id] ?? 0;
      const key = getStatusKeyFromProgress(progress);

      if (statusFilter === 'all') return true;
      return key === statusFilter;
    });

    const sorted = [...byStatus].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      if (sortOrder === 'newest') return db - da;
      return da - db;
    });

    return sorted;
  }, [projects, projectProgress, search, statusFilter, sortOrder]);

  // === [9] HANDLERS ===
  function handleDelete(e: React.MouseEvent, projectId: string) {
    e.stopPropagation();
    const yes = window.confirm(
      'Are you sure you want to delete this project?'
    );
    if (!yes) return;

    supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to delete project:', error);
          alert('Failed to delete project.');
          return;
        }

        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      });
  }

  function formatDate(value: string) {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // === [10] RENDER ===
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* HERO SECTION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="mt-2 text-slate-600 max-w-xl">
                Manage your manufacturing projects, track roadmap progress, and refine your product specifications.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/playbook-wizard')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* STATS & DRAFT ROW */}
        <section className="grid gap-6 md:grid-cols-12">
          {/* STATS */}
          <div className="md:col-span-8 grid gap-4 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Squares2X2Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Total Projects</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Avg. Progress</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{averageProgress}%</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Active Drafts</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{draftPlaybook ? 1 : 0}</p>
            </div>
          </div>

          {/* DRAFT PLAYBOOK CARD (IF EXISTS) OR PROMO */}
          <div className="md:col-span-4">
            {draftPlaybook ? (
              <div className="h-full rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between group cursor-pointer hover:border-blue-200 transition-all" onClick={() => router.push('/playbook-summary')}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Draft in progress
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                    {draftPlaybook.productName || 'Untitled Project'}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {draftPlaybook.free?.summary || 'Continue refining your product idea...'}
                  </p>
                </div>
                <button className="mt-4 w-full rounded-lg bg-slate-50 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  Continue Editing
                </button>
              </div>
            ) : (
              <div className="h-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100 flex flex-col justify-center items-start text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Start a new idea</h3>
                <p className="text-sm text-blue-700/80 mb-4">
                  Use the AI wizard to generate a full manufacturing spec in minutes.
                </p>
                <button
                  onClick={() => router.push('/playbook-wizard')}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  Launch Wizard <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="space-y-6">
          {/* TOOLBAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Your Projects</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                {(['all', 'in-progress', 'completed'] as const).map((key) => {
                  const active = statusFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {key === 'all' ? 'All' : key === 'in-progress' ? 'Active' : 'Done'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GRID */}
          {loadingProjects ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
              {error}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <FunnelIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first manufacturing project."}
              </p>
              {(search || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); }}
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const progress = projectProgress[project.id] ?? 0;
                const statusLabel = getStatusLabelFromProgress(progress);
                const colors = getStatusColor(progress);
                const createdLabel = formatDate(project.created_at);
                const category = projectCategories[project.id] || 'Other';

                return (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="group relative bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-blue-100/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        <span className={`h-1.5 w-1.5 rounded-full ${colors}`} />
                        {statusLabel}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors -mr-2 -mt-2 opacity-0 group-hover:opacity-100"
                        title="Delete Project"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-50 mt-auto">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span>{category}</span>
                        <span>{createdLabel}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${colors}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}