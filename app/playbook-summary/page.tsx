'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Components
import PlaybookHeader from '@/components/playbook/PlaybookHeader';
import PlaybookKeyInfo from '@/components/playbook/PlaybookKeyInfo';
import PlaybookMaterialsFeatures from '@/components/playbook/PlaybookMaterialsFeatures';
import PlaybookFinancials from '@/components/playbook/PlaybookFinancials';
import PlaybookBOM from '@/components/playbook/PlaybookBOM'; // <--- NEW IMPORT
import PlaybookApproachRisks from '@/components/playbook/PlaybookApproachRisks';
import PlaybookTimelineNext from '@/components/playbook/PlaybookTimelineNext';
import PlaybookActions from '@/components/playbook/PlaybookActions';

export default function PlaybookSummaryPage() {
  const router = useRouter();
  const [playbook, setPlaybook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('manupilotPlaybook');
      if (stored) {
        setPlaybook(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, []);

  function handleUpdate(section: string, data: any) {
    const updated = { ...playbook, free: { ...playbook.free, [section]: data } };
    setPlaybook(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('manupilotPlaybook', JSON.stringify(updated));
    }
  }

  async function handleCreateProject() {
    if (!playbook) return;
    setCreatingProject(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save this project.');
        return;
      }

      // Get category from localStorage (set during wizard)
      const category = window.localStorage.getItem('manupilot_temp_category') || 'Other';

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: playbook.productName || 'New Project',
          description: playbook.free.summary,
          user_id: user.id,
          image_url: playbook.free.projectImage || null, // Save the project image URL
          category: category, // Save the category to database
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project.');
        return;
      }

      // Save locked playbook
      window.localStorage.setItem(`manupilot_playbook_project_${project.id}`, JSON.stringify(playbook));

      // Initialize Roadmap Progress
      const roadmapState: any = {};
      playbook.free.roadmapPhases?.forEach((phase: any) => {
        // Initialize empty state
      });
      window.localStorage.setItem(`manupilot_project_${project.id}_roadmap`, JSON.stringify(roadmapState));

      // Clear draft and temp category
      window.localStorage.removeItem('manupilotPlaybook');
      window.localStorage.removeItem('manupilot_temp_category');

      router.push(`/projects/${project.id}`);
    } finally {
      setCreatingProject(false);
    }
  }

  function handleCreateNew() {
    window.localStorage.removeItem('manupilotPlaybook');
    router.push('/playbook-wizard');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  if (!playbook) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">No draft found. Start a new wizard.</div>;

  const free = playbook.free || {};

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Your Manufacturing Plan</h1>
          <button onClick={() => router.push('/playbook-wizard')} className="text-sm text-slate-500 hover:underline">Start Over</button>
        </div>

        <PlaybookHeader
          productName={playbook.productName}
          summary={free.summary}
          projectImage={free.projectImage}
          onUpdateSummary={(val) => handleUpdate('summary', val)}
        />

        {/* 1. FINANCIALS */}
        <PlaybookFinancials financials={free.financials} />

        {/* 2. NEW BOM TABLE */}
        <PlaybookBOM bom={free.bomDraft} />

        {/* 3. KEY INFO GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          <PlaybookKeyInfo
            targetCustomer={free.targetCustomer}
            manufacturingRegions={free.manufacturingRegions}
            regionRationale={free.regionRationale}
            onUpdate={(k, v) => handleUpdate(k, v)}
          />
          <PlaybookMaterialsFeatures
            materials={free.materials}
            features={free.keyFeatures}
            onUpdate={(k, v) => handleUpdate(k, v)}
          />
        </div>

        {/* 4. APPROACH & RISKS */}
        <PlaybookApproachRisks
          approach={free.manufacturingApproach?.approach}
          risks={free.manufacturingApproach?.risks}
          dfmWarnings={free.manufacturingApproach?.dfmWarnings}
          complianceTasks={free.manufacturingApproach?.complianceTasks}
        />

        {/* 5. TIMELINE */}
        <PlaybookTimelineNext
          timeline={free.timeline}
          nextSteps={free.nextSteps}
        />

        {/* 6. CREATE ACTION */}
        <PlaybookActions
          creatingProject={creatingProject}
          onCreateProject={handleCreateProject}
          onCreateNew={handleCreateNew}
        />
      </div>
    </main>
  );
}