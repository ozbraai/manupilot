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
import FeasibilityCard from '@/components/FeasibilityCard';

// NEW COMPONENTS
import PlaybookStickyBar from '@/components/playbook/PlaybookStickyBar';
import ProjectCreationModal from '@/components/playbook/ProjectCreationModal';
import PlaybookPremiumUpsell from '@/components/playbook/PlaybookPremiumUpsell';

import { FeasibilityScores } from '@/lib/feasibility';

export default function PlaybookSummaryPage() {
  const router = useRouter();
  const [playbook, setPlaybook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creationProgress, setCreationProgress] = useState('');

  // NEW: Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [creationStep, setCreationStep] = useState<'snapshot' | 'analysis' | 'saving' | 'complete'>('snapshot');
  const [progressPercent, setProgressPercent] = useState(0);

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
    setShowProgressModal(true);
    setCreationStep('snapshot');
    setProgressPercent(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save this project.');
        setCreatingProject(false);
        setShowProgressModal(false);
        return;
      }

      // Step 1: Generate playbook snapshot
      setCreationStep('snapshot');
      setProgressPercent(10);
      console.log('Creating playbook snapshot...');

      const snapshotResponse = await fetch('/api/playbook/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookData: playbook }),
      });

      if (!snapshotResponse.ok) {
        throw new Error('Failed to create playbook snapshot');
      }

      const { snapshot } = await snapshotResponse.json();
      setProgressPercent(25);
      console.log('Snapshot created successfully');

      // Step 2: Generate deep AI analysis
      setCreationStep('analysis');
      setProgressPercent(30);
      console.log('Generating deep manufacturing intelligence...');

      const analysisResponse = await fetch('/api/playbook/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.details || 'Failed to generate analysis');
      }

      // Simulate progress during AI analysis (30% to 85%)
      const analysisInterval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 85) {
            clearInterval(analysisInterval);
            return 85;
          }
          return prev + 2;
        });
      }, 500);

      const { ai_analysis } = await analysisResponse.json();
      clearInterval(analysisInterval);
      setProgressPercent(85);
      console.log('Deep analysis generated');

      // Step 3: Create project
      setCreationStep('saving');
      setProgressPercent(90);
      console.log('Creating project...');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: snapshot.product_name,
          description: snapshot.final_edits.summary,
          category: snapshot.category,
          playbook_snapshot: snapshot,
          ai_analysis: ai_analysis,
          feasibility: snapshot.feasibility,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      setProgressPercent(95);
      console.log('Project created:', project.id);

      // Save locked playbook to localStorage (for backward compatibility)
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

      // Complete!
      setCreationStep('complete');
      setProgressPercent(100);

      // Short delay before redirect
      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push(`/projects/${project.id}`);
    } catch (error: any) {
      console.error('Error in handleCreateProject:', error);
      setShowProgressModal(false);
      alert(`Failed to create project: ${error.message}`);
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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Progress Modal */}
      <ProjectCreationModal
        isOpen={showProgressModal}
        currentStep={creationStep}
        progress={progressPercent}
      />

      {/* 1. STICKY BAR */}
      <PlaybookStickyBar
        onCreateProject={handleCreateProject}
        creatingProject={creatingProject}
        creationProgress={creationProgress}
      />

      <div className="max-w-5xl mx-auto px-4 space-y-8 pt-8">

        {/* 1. HERO SECTION */}
        <PlaybookHeader
          productName={playbook.productName}
          summary={free.summary}
          projectImage={free.projectImage}
          wizardInput={playbook.wizardInput}
          onUpdateSummary={(val) => handleUpdate('summary', val)}
          onUpdateWizardInput={(wizardInput) => {
            const updated = { ...playbook, wizardInput };
            setPlaybook(updated);
            window.localStorage.setItem('manupilotPlaybook', JSON.stringify(updated));
          }}
        />

        {/* 2. FEASIBILITY SNAPSHOT */}
        {free.feasibility && (
          <FeasibilityCard
            feasibility={free.feasibility as FeasibilityScores}
            productStyle={
              playbook.mode === 'white-label' ? 'White Label' :
                playbook.mode === 'custom' ? 'Custom' :
                  playbook.mode === 'combination' ? 'Hybrid' :
                    undefined
            }
            uniquenessFactor={playbook.uniquenessFactor}
            uniquenessPoints={
              playbook.differentiationText
                ? [playbook.differentiationText]
                : [
                  playbook.mode === 'custom' ? 'Custom design with unique specifications.' : 'Standard product with potential for branding.',
                  !playbook.selectedSimilarProductId ? 'No direct similar products identified.' : 'Similar products exist in the market.'
                ]
            }
            showInsights={true}
          />
        )}

        {/* 3. FINANCIAL PREVIEW */}
        <PlaybookFinancials
          financials={free.financials}
          preview={true}
          userOverrides={playbook.userOverrides}
          onUpdateOverrides={(overrides) => {
            const updated = { ...playbook, userOverrides: overrides };
            setPlaybook(updated);
            window.localStorage.setItem('manupilotPlaybook', JSON.stringify(updated));
          }}
        />

        {/* 4. EXECUTION ROADMAP */}
        <PlaybookTimelineNext
          timeline={free.timeline}
          nextSteps={free.nextSteps}
          preview={true}
          variant="single"
        />

        {/* 6. CORE SPECS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">🧱</span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Core Specs
            </h3>
          </div>
          <PlaybookMaterialsFeatures
            materials={free.materials}
            features={free.keyFeatures}
            onUpdate={(k, v) => handleUpdate(k, v)}
            preview={true}
          />
        </div>

        {/* 7. RISKS */}
        <PlaybookApproachRisks
          approach={free.manufacturingApproach?.approach}
          risks={free.manufacturingApproach?.risks}
          dfmWarnings={free.manufacturingApproach?.dfmWarnings}
          complianceTasks={free.manufacturingApproach?.complianceTasks}
          preview={true}
        />

        {/* 8. PREMIUM UPSELL */}
        <PlaybookPremiumUpsell
          onCreateProject={handleCreateProject}
          creatingProject={creatingProject}
        />

      </div>
    </main>
  );
}