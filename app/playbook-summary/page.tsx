'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type RoadmapPhase = {
  id: string;
  name: string;
  description: string;
  tasks: string[];
};

type FreeSection = {
  summary: string;
  targetCustomer: string;
  keyFeatures: string[];
  materials: string[];
  manufacturingApproach: {
    recommendedRegions: string[];
    rationale: string;
    risks: string[];
  };
  pricing: {
    positioning: string;
    insight: string;
  };
  timeline: string[];
  nextSteps: string[];
  roadmapPhases?: RoadmapPhase[];
};

type Playbook = {
  productName: string;
  free: FreeSection;
  premium?: any;
};

export default function PlaybookSummaryPage() {
  const router = useRouter();

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load playbook from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem('manupilotPlaybook');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setPlaybook(parsed);
    } catch (e) {
      console.error('Failed to parse playbook:', e);
    }
  }, []);

  async function handleCreateProject() {
    try {
      setError(null);
      setCreatingProject(true);

      if (!playbook) throw new Error('No playbook data available.');

      // 1. User must be logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in or register before creating a project.');
      }

      // 2. Create row in projects table
      const title = playbook.productName || 'New ManuPilot Project';
      const desc = playbook.free?.summary || '';

      const { data: projectRow, error: projectError } = await supabase
        .from('projects')
        .insert({
          title,
          description: desc,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError || !projectRow) {
        console.error(projectError);
        throw new Error('Could not create project.');
      }

      // 3. Save playbook under project ID
      localStorage.setItem(
        `manupilot_playbook_project_${projectRow.id}`,
        JSON.stringify(playbook)
      );

      // 4. Redirect to roadmap
      router.push(`/projects/${projectRow.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setCreatingProject(false);
    }
  }

  if (!playbook) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">No playbook found</h1>
          <p className="text-slate-600">Try creating a new playbook first.</p>
          <button
            onClick={() => router.push('/playbook-wizard')}
            className="px-6 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500"
          >
            Create Playbook
          </button>
        </div>
      </main>
    );
  }

  const free = playbook.free;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto pt-16 px-4 md:px-0 space-y-10">

        {/* HEADER */}
        <section className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
            Manufacturing Playbook
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
            {playbook.productName}
          </h1>
          <p className="text-slate-700 text-base md:text-lg">{free.summary}</p>
        </section>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* TWO-COLUMN FREE CONTENT */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Target customer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Target Customer
            </h2>
            <p className="text-sm text-slate-700 mb-4">{free.targetCustomer}</p>

            <h3 className="text-sm font-semibold text-slate-900">Key Features</h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mt-1">
              {free.keyFeatures.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Materials + pricing */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Materials</h2>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {free.materials.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Pricing & Positioning
              </h2>
              <p className="text-sm text-slate-700 mb-2">
                {free.pricing.positioning}
              </p>
              <p className="text-sm text-slate-700">
                {free.pricing.insight}
              </p>
            </div>
          </div>
        </section>

        {/* MANUFACTURING APPROACH */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Manufacturing Approach</h2>

          <h3 className="text-sm font-semibold text-slate-900 mt-1">
            Recommended Regions
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-700">
            {free.manufacturingApproach.recommendedRegions.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>

          <p className="text-sm text-slate-700">
            {free.manufacturingApproach.rationale}
          </p>

          <h3 className="text-sm font-semibold text-slate-900 mt-3">Risks</h3>
          <ul className="list-disc list-inside text-sm text-slate-700">
            {free.manufacturingApproach.risks.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </section>

        {/* Timeline + Next Steps */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Timeline</h2>
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              {free.timeline.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ol>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Next Steps</h2>
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              {free.nextSteps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <section className="flex flex-col md:flex-row justify-between mt-4 gap-3 md:items-center">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
            >
              Print / Save as PDF
            </button>

            <button
              onClick={() => router.push('/playbook-wizard')}
              className="px-5 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
            >
              Create Another Playbook
            </button>
          </div>

          <button
            onClick={handleCreateProject}
            disabled={creatingProject}
            className="px-6 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-60"
          >
            {creatingProject ? 'Creating Project…' : 'Create Project From This Playbook'}
          </button>
        </section>

        {/* Pricing section */}
        <section className="mt-12">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-10">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Want a complete manufacturing plan for your product?
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                Upgrade to unlock full cost breakdowns, BOM, competitor analysis, safety & compliance, and more.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {/* Standard Report */}
              <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Standard Report
                  </h3>
                  <p className="text-2xl font-semibold text-slate-900">$39</p>
                  <p className="text-xs text-slate-500 mt-1">One-time</p>
                </div>

                <ul className="text-sm text-slate-700 space-y-2 flex-1 text-left">
                  <li>• Full manufacturing playbook</li>
                  <li>• Cost breakdown</li>
                  <li>• BOM (Bill of Materials)</li>
                  <li>• Competitor benchmarking</li>
                  <li>• Compliance checklist</li>
                </ul>

                <button className="mt-5 w-full rounded-full bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition">
                  Get Standard Report
                </button>
              </div>

              {/* Pro Membership */}
              <div className="relative flex flex-col rounded-2xl border border-sky-400 bg-sky-50 p-6 shadow-md md:scale-105 md:-mt-2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Most Popular
                </span>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Pro Membership
                  </h3>
                  <p className="text-2xl font-semibold text-slate-900">$9</p>
                  <p className="text-xs text-slate-500 mt-1">Monthly</p>
                </div>

                <ul className="text-sm text-slate-800 space-y-2 flex-1 text-left">
                  <li>• Everything in Standard Report</li>
                  <li>• Unlimited playbooks</li>
                  <li>• Unlimited revisions</li>
                  <li>• Save to projects</li>
                  <li>• Download branded PDFs</li>
                </ul>

                <button className="mt-5 w-full rounded-full bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-500 transition">
                  Join Pro Membership
                </button>
              </div>

              {/* Premium Bundle */}
              <div className="relative flex flex-col rounded-2xl border border-amber-300 bg-amber-50/60 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Premium Bundle
                  </h3>
                  <p className="text-2xl font-semibold text-slate-900">$99</p>
                  <p className="text-xs text-slate-500 mt-1">One-time</p>
                </div>

                <ul className="text-sm text-slate-800 space-y-2 flex-1 text-left">
                  <li>• Everything in Pro Membership</li>
                  <li>• Personalised sourcing plan</li>
                  <li>• Factory outreach templates</li>
                  <li>• Supplier scoring sheet</li>
                  <li>• Packaging & launch checklist</li>
                  <li>• Early-access features</li>
                </ul>

                <button className="mt-5 w-full rounded-full bg-amber-500 text-slate-900 text-sm font-medium py-2.5 hover:bg-amber-400 transition">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}