'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

type CompletionState = {
  [phaseId: string]: {
    [taskId: string]: boolean;
  };
};

type ProjectProgressMap = {
  [projectId: string]: number;
};

type DraftPlaybook = {
  productName: string;
  summary: string;
};

type ProjectCategoryMap = {
  [projectId: string]: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [progressMap, setProgressMap] = useState<ProjectProgressMap>({});
  const [categoryMap, setCategoryMap] = useState<ProjectCategoryMap>({});

  const [draftPlaybook, setDraftPlaybook] = useState<DraftPlaybook | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =======================
  // LOAD PROJECTS + PROGRESS + DRAFT PLAYBOOK
  // =======================
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
        }

        if (!user) {
          setError('Please log in to view your projects.');
          return;
        }

        const { data, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (projectError) {
          console.error('Project load error:', projectError);
          setError('Could not load projects.');
          return;
        }

        const typedProjects = (data || []) as Project[];
        setProjects(typedProjects);

        // Compute progress & draft playbook on client
        if (typeof window !== 'undefined') {
          // Progress per project
          const newProgress: ProjectProgressMap = {};

          typedProjects.forEach((project) => {
            try {
              const pbRaw = window.localStorage.getItem(
                `manupilot_playbook_project_${project.id}`
              );
              const rmRaw = window.localStorage.getItem(
                `manupilot_project_${project.id}_roadmap`
              );

              if (!pbRaw || !rmRaw) {
                newProgress[project.id] = 0;
                return;
              }

              const playbook = JSON.parse(pbRaw);
              const completion = JSON.parse(rmRaw) as CompletionState;
              const phases = playbook?.free?.roadmapPhases;

              if (!phases || !Array.isArray(phases) || phases.length === 0) {
                newProgress[project.id] = 0;
                return;
              }

              let totalTasks = 0;
              let completedTasks = 0;

              phases.forEach((phase: any) => {
                const phaseId = phase.id || phase.name;
                const tasks: string[] = phase.tasks || [];

                tasks.forEach((_: any, idx: number) => {
                  totalTasks += 1;
                  const taskId = `${phaseId}_task_${idx}`;
                  const isDone = completion?.[phaseId]?.[taskId] === true;
                  if (isDone) completedTasks += 1;
                });
              });

              newProgress[project.id] =
                totalTasks === 0
                  ? 0
                  : Math.round((completedTasks / totalTasks) * 100);
            } catch (e) {
              console.error('Progress compute error:', e);
              newProgress[project.id] = 0;
            }
          });

          setProgressMap(newProgress);

          // Draft playbook not yet turned into a project
          const draftRaw = window.localStorage.getItem('manupilotPlaybook');
          if (draftRaw) {
            try {
              const pb = JSON.parse(draftRaw);
              const name = pb.productName || 'Untitled product';
              const summary = pb.free?.summary || '';
              setDraftPlaybook({ productName: name, summary });
            } catch (e) {
              console.error('Draft playbook parse error:', e);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =======================
  // AI CATEGORY CLASSIFICATION PER PROJECT
  // =======================
  useEffect(() => {
    if (projects.length === 0 || typeof window === 'undefined') return;

    const nextMap: ProjectCategoryMap = { ...categoryMap };
    const toFetch: Project[] = [];

    projects.forEach((project) => {
      if (nextMap[project.id]) return;

      const storageKey = `manupilot_project_${project.id}_category`;
      const cached = window.localStorage.getItem(storageKey);

      if (cached) {
        nextMap[project.id] = cached;
      } else {
        toFetch.push(project);
      }
    });

    if (Object.keys(nextMap).length > 0) {
      setCategoryMap(nextMap);
    }

    if (toFetch.length === 0) return;

    // Call AI route for uncategorised projects
    Promise.all(
      toFetch.map(async (project) => {
        try {
          const res = await fetch('/api/project-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: project.title,
              description: project.description,
            }),
          });

          const data = await res.json();
          const category = data.category || 'General';

          window.localStorage.setItem(
            `manupilot_project_${project.id}_category`,
            category
          );

          setCategoryMap((prev) => ({
            ...prev,
            [project.id]: category,
          }));
        } catch (e) {
          console.error('Failed to fetch category for project', project.id, e);
        }
      })
    );
  }, [projects]);

  // =======================
  // HANDLERS
  // =======================

  function handleNewPlaybook() {
    router.push('/playbook-wizard');
  }

  function handleOpenProject(id: string) {
    router.push(`/projects/${id}`);
  }

  async function handleDeleteProject(id: string) {
    const confirmed = window.confirm(
      'Delete this project from ManuPilot? This does not affect any real-world work, only this workspace.'
    );
    if (!confirmed) return;

    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to delete a project.');
        return;
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Delete project error:', deleteError);
        setError('Could not delete project.');
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`manupilot_playbook_project_${id}`);
        window.localStorage.removeItem(`manupilot_project_${id}_roadmap`);
        window.localStorage.removeItem(`manupilot_project_${id}_category`);
      }

      setProgressMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setCategoryMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e: any) {
      console.error('Delete project error:', e);
      setError('Something went wrong deleting the project.');
    }
  }

  function statusLabel(progress: number) {
    if (progress === 100) return 'Completed';
    if (progress === 0) return 'Not started';
    return 'In progress';
  }

  function statusIcon(progress: number) {
    if (progress === 100) return '✅';
    if (progress === 0) return '⏸️';
    return '⏱️';
  }

  const totalProjects = projects.length;
  const averageProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce(
            (sum, p) => sum + (progressMap[p.id] ?? 0),
            0
          ) / totalProjects
        )
      : 0;

  // =======================
  // FILTER + SEARCH + SORT
  // =======================

  const filteredProjects = projects
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    })
    .filter((p) => {
      const prog = progressMap[p.id] ?? 0;
      if (filter === 'completed') return prog === 100;
      if (filter === 'not-started') return prog === 0;
      if (filter === 'in-progress') return prog > 0 && prog < 100;
      return true;
    })
    .sort((a, b) => {
      const pa = progressMap[a.id] ?? 0;
      const pb = progressMap[b.id] ?? 0;

      if (sort === 'newest')
        return +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === 'oldest')
        return +new Date(a.created_at) - +new Date(b.created_at);

      if (sort === 'highest') return pb - pa;
      if (sort === 'lowest') return pa - pb;

      return 0;
    });

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto pt-12 px-4 md:px-0 space-y-8">
        {/* HEADER */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-sm md:text-base text-slate-600">
              View your products in development, draft playbooks, and roadmap
              progress across ManuPilot.
            </p>
          </div>
          <button
            onClick={handleNewPlaybook}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
          >
            + Start new Playbook
          </button>
        </section>

        {/* STATS */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
              Projects
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {totalProjects}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ManuPilot workspaces currently in your account
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
              Average progress
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {averageProgress}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Based on roadmap tasks completed across projects
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
              Next step
            </p>
            <p className="text-sm text-slate-700 mt-1">
              Continue with a project below or start a new idea to explore
              another product concept.
            </p>
          </div>
        </section>

        {/* DRAFT PLAYBOOK */}
        {draftPlaybook && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
              Draft Playbook
            </p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              {draftPlaybook.productName}
            </h2>
            {draftPlaybook.summary && (
              <p className="mt-1 text-sm text-slate-700 line-clamp-3">
                {draftPlaybook.summary}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/playbook-summary')}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-800 hover:bg-slate-100 transition"
              >
                Continue playbook
              </button>
              <button
                onClick={handleNewPlaybook}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-800 hover:bg-slate-100 transition"
              >
                Start new idea
              </button>
            </div>
          </section>
        )}

        {/* ERROR */}
        {error && (
          <section className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4">
            {error}
          </section>
        )}

        {/* SEARCH + FILTER + SORT */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All"
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                label="Not started"
                active={filter === 'not-started'}
                onClick={() => setFilter('not-started')}
              />
              <FilterChip
                label="In progress"
                active={filter === 'in-progress'}
                onClick={() => setFilter('in-progress')}
              />
              <FilterChip
                label="Completed"
                active={filter === 'completed'}
                onClick={() => setFilter('completed')}
              />
            </div>
            <select
              className="border border-slate-300 text-sm rounded-xl px-3 py-2 bg-white"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')
              }
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest progress</option>
              <option value="lowest">Lowest progress</option>
            </select>
          </div>
        </section>

        {/* PROJECT CARDS */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading projects…</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-sm text-slate-500">No projects match your filters.</p>
          ) : (
            filteredProjects.map((project) => {
              const progress = progressMap[project.id] ?? 0;
              const createdDate = new Date(project.created_at).toLocaleDateString();
              const category = categoryMap[project.id] || 'General';

              return (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Status + Created */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{statusIcon(progress)}</span>
                      <span>{statusLabel(progress)}</span>
                    </div>
                    <span className="text-xs text-slate-400">Created {createdDate}</span>
                  </div>

                  {/* Title + Category */}
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-slate-900 truncate">
                      {project.title}
                    </h2>
                    <span className="inline-flex mt-1 items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      {category}
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-1.5 bg-sky-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-between gap-2">
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-800 hover:bg-slate-100 transition"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-4 py-2 rounded-full border border-red-300 text-sm text-red-700 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

// Small reusable chip
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-4 py-1.5 rounded-full text-xs font-medium transition ' +
        (active
          ? 'bg-sky-600 text-white'
          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100')
      }
    >
      {label}
    </button>
  );
}