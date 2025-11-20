'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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

function getStatusDotClass(progress: number): string {
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
  function handleDelete(projectId: string) {
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
      month: '2-digit',
      year: 'numeric',
    });
  }

  // === [10] RENDER ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto pt-12 px-4 md:px-0 space-y-8">
        {/* HEADER */}
        <section>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            View your products in development, draft playbooks, and roadmap progress across ManuPilot.
          </p>
        </section>

        {/* STATS ROW */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
              Projects
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {totalProjects}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ManuPilot workspaces currently in your account.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
              Average progress
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {averageProgress}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Based on roadmap tasks completed across projects.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                Next step
              </p>
              <p className="text-xs text-slate-600">
                Continue building momentum on existing projects or explore a new idea.
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/playbook-wizard')}
                className="inline-flex items-center rounded-full bg-sky-600 text-white text-xs font-medium px-4 py-2 hover:bg-sky-500"
              >
                + Start new Playbook
              </button>
            </div>
          </div>
        </section>

        {/* DRAFT PLAYBOOK OR CTA */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {draftPlaybook ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                Draft playbook
              </p>
              <h2 className="text-base font-semibold text-slate-900">
                {draftPlaybook.productName || 'Untitled concept'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {draftPlaybook.free?.summary ||
                  'You have a playbook in progress. Continue refining it or start a new idea.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/playbook-summary')}
                  className="px-4 py-2 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Continue playbook
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/playbook-wizard')}
                  className="px-4 py-2 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Start new idea
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                Ready for your next idea?
              </p>
              <h2 className="text-base font-semibold text-slate-900">
                What exciting product are you designing next?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Start a new ManuPilot playbook to explore a new product concept and let the
                AI help you map out components, suppliers, and manufacturing strategy.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => router.push('/playbook-wizard')}
                  className="px-5 py-2 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
                >
                  Start new idea
                </button>
              </div>
            </>
          )}
        </section>

        {/* PROJECT TOOLBAR */}
        <section className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Filters + Sort */}
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {/* Status filter */}
              <div className="inline-flex rounded-full bg-slate-100 p-1">
                {(['all', 'not-started', 'in-progress', 'completed'] as StatusKey[]).map(
                  (key) => {
                    const label =
                      key === 'all'
                        ? 'All'
                        : key === 'not-started'
                        ? 'Not started'
                        : key === 'in-progress'
                        ? 'In progress'
                        : 'Completed';
                    const active = statusFilter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatusFilter(key)}
                        className={
                          'px-3 py-1 rounded-full font-medium ' +
                          (active
                            ? 'bg-sky-600 text-white'
                            : 'bg-transparent text-slate-700')
                        }
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Sort
                </span>
                <select
                  className="border border-slate-300 text-xs rounded-full px-3 py-1 bg-white"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as SortOption)
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT CARDS GRID */}
        <section>
          {loadingProjects ? (
            <p className="text-sm text-slate-500 mt-4">Loading projects…</p>
          ) : error ? (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-sm text-slate-500 mt-4">
              No projects match your filters.
            </p>
          ) : (
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const progress = projectProgress[project.id] ?? 0;
                const statusLabel = getStatusLabelFromProgress(progress);
                const statusDotClass = getStatusDotClass(progress);
                const createdLabel = formatDate(project.created_at);
                const category = projectCategories[project.id] || 'Other';

                return (
                  <article
                    key={project.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span
                            className={`inline-flex h-2 w-2 rounded-full ${statusDotClass}`}
                          />
                          <span>{statusLabel}</span>
                        </p>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-slate-600 line-clamp-3">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <p className="mb-1">Created {createdLabel}</p>
                        {category && category !== 'Other' && (
                          <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-1">
                      <p className="text-[11px] text-slate-500 mb-1">
                        Progress
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-1.5 bg-sky-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {progress}%
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="px-4 py-1.5 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-1.5 rounded-full border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}