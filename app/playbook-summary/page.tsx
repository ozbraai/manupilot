'use client';

// === [0] IMPORTS ===
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

import PlaybookHeader from '@/components/playbook/PlaybookHeader';
import PlaybookKeyInfo from '@/components/playbook/PlaybookKeyInfo';
import PlaybookMaterialsFeatures from '@/components/playbook/PlaybookMaterialsFeatures';
import PlaybookApproachRisks from '@/components/playbook/PlaybookApproachRisks';
import PlaybookTimelineNext from '@/components/playbook/PlaybookTimelineNext';
import PlaybookActions from '@/components/playbook/PlaybookActions';
import PlaybookPremiumUpsell from '@/components/playbook/PlaybookPremiumUpsell';

// === [1] TYPES ===
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
  components?: any;
};

type Playbook = {
  productName: string;
  free: FreeSection;
  premium?: any;
};

export default function PlaybookSummaryPage() {
  const router = useRouter();

  // === [2] STATE ===
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === [3] LOAD PLAYBOOK (ONCE) ===
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem('manupilotPlaybook');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Playbook;
      setPlaybook(parsed);
    } catch (e) {
      console.error('Failed to parse playbook from localStorage:', e);
    }
  }, []);

  // === [4] HELPER: UPDATE FREE SECTION + SYNC TO LOCALSTORAGE ===
  function updateFree(updater: (prev: FreeSection) => FreeSection) {
    setPlaybook((prev) => {
      if (!prev) return prev;
      const updatedFree = updater(prev.free);
      const next: Playbook = { ...prev, free: updatedFree };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('manupilotPlaybook', JSON.stringify(next));
      }
      return next;
    });
  }

  // === [5] EDIT HANDLERS ===
  const handleUpdateSummary = (summary: string) =>
    updateFree((prev) => ({ ...prev, summary }));

  const handleUpdateTargetCustomer = (targetCustomer: string) =>
    updateFree((prev) => ({ ...prev, targetCustomer }));

  const handleUpdateMaterials = (materials: string[]) =>
    updateFree((prev) => ({ ...prev, materials }));

  const handleUpdateFeatures = (keyFeatures: string[]) =>
    updateFree((prev) => ({ ...prev, keyFeatures }));

  const handleUpdateApproach = (rationale: string) =>
    updateFree((prev) => ({
      ...prev,
      manufacturingApproach: {
        ...prev.manufacturingApproach,
        rationale,
      },
    }));

  const handleUpdateRisks = (risks: string[]) =>
    updateFree((prev) => ({
      ...prev,
      manufacturingApproach: {
        ...prev.manufacturingApproach,
        risks,
      },
    }));

  const handleUpdateTimeline = (timeline: string[]) =>
    updateFree((prev) => ({ ...prev, timeline }));

  const handleUpdateNextSteps = (nextSteps: string[]) =>
    updateFree((prev) => ({ ...prev, nextSteps }));

  // === [6] CREATE PROJECT FROM PLAYBOOK ===
  async function handleCreateProject() {
    try {
      setError(null);
      setCreatingProject(true);

      if (!playbook) {
        throw new Error('No playbook data available.');
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please log in or register before creating a project.');
      }

      const title =
        playbook.productName && playbook.productName.trim().length > 0
          ? playbook.productName
          : 'New ManuPilot Project';

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
        console.error('Project creation error:', projectError);
        throw new Error('Could not create project.');
      }

      // Save edited playbook as the canonical version for this project
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `manupilot_playbook_project_${projectRow.id}`,
          JSON.stringify(playbook)
        );
      }

      router.push(`/projects/${projectRow.id}`);
    } catch (err: any) {
      console.error('Create project from playbook error:', err);
      setError(err.message || 'Failed to create project from this playbook.');
    } finally {
      setCreatingProject(false);
    }
  }

  // === [7] NO PLAYBOOK FALLBACK ===
  if (!playbook) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            No playbook found
          </h1>
          <p className="text-slate-600 text-sm">
            It looks like there’s no recent playbook data. Try creating one through the wizard.
          </p>
          <button
            onClick={() => router.push('/playbook-wizard')}
            className="mt-2 px-6 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500"
          >
            Start the Manufacturing Wizard
          </button>
        </div>
      </main>
    );
  }

  const free = playbook.free;

  // === [8] MAIN VIEW ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto pt-16 px-4 md:px-0 space-y-10">

        {/* [8.1] HEADER (editable summary) */}
        <PlaybookHeader
          productName={playbook.productName}
          summary={free.summary}
          onUpdateSummary={handleUpdateSummary}
        />

        {/* [8.2] ERROR BANNER */}
        {error && (
          <section className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </section>
        )}

        {/* [8.3] KEY INFO (editable target customer) */}
        <PlaybookKeyInfo
          free={free}
          onUpdateTargetCustomer={handleUpdateTargetCustomer}
        />

        {/* [8.4] MATERIALS + FEATURES (editable) */}
        <PlaybookMaterialsFeatures
          free={free}
          onUpdateMaterials={handleUpdateMaterials}
          onUpdateFeatures={handleUpdateFeatures}
        />

        {/* [8.5] APPROACH & RISKS (editable) */}
        <PlaybookApproachRisks
          free={free}
          onUpdateApproach={handleUpdateApproach}
          onUpdateRisks={handleUpdateRisks}
        />

        {/* [8.6] TIMELINE + NEXT STEPS (editable) */}
        <PlaybookTimelineNext
          free={free}
          onUpdateTimeline={handleUpdateTimeline}
          onUpdateNextSteps={handleUpdateNextSteps}
        />

        {/* [8.7] ACTIONS */}
        <PlaybookActions
          creatingProject={creatingProject}
          onCreateProject={handleCreateProject}
          onCreateNew={() => router.push('/playbook-wizard')}
        />

        {/* [8.8] PREMIUM UPSELL */}
        <PlaybookPremiumUpsell />
      </div>
    </main>
  );
}