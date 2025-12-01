import { loadProject } from '@/lib/project-loader';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Layout
import ProjectShell from '@/components/project/ProjectShell';

// Components
import ProjectHero from '@/components/project/ProjectHero';
import ActionCenter from '@/components/project/ActionCenter';
import PhaseContextPanel from '@/components/project/PhaseContextPanel';
import ReferenceAccordion from '@/components/project/ReferenceAccordion';
import FeasibilitySnapshot from '@/components/project/FeasibilitySnapshot';
import DownloadPDFButton from '@/components/pdf/DownloadPDFButton';

// AI Analysis Components
import BOMDraft from '@/components/project/BOMDraft';
import CertificationMap from '@/components/project/CertificationMap';
import RiskMap from '@/components/project/RiskMap';

// Helpers
import { calculateProgress } from '@/lib/progress';

export default async function ProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    // Check NDA Status (Server-side)
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { },
            },
        }
    );

    let isNdaSigned = false;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: nda } = await supabase
                .from('nda_signatures')
                .select('id')
                .eq('user_id', user.id)
                .single();
            isNdaSigned = !!nda;
        }
    } catch (e) {
        console.error('Failed to check NDA status', e);
    }

    // Calculate Progress
    // We need to cast the loaded project back to the shape expected by calculateProgress
    // or update calculateProgress to accept LoadedProject. For now, we'll cast.
    const projectProgress = calculateProgress(project as any);

    // Prepare Data for Components
    const margin = project.unitEconomics?.grossMargin
        ? parseFloat(project.unitEconomics.grossMargin.replace('%', ''))
        : null;

    const riskLevel = project.feasibility?.risk?.riskLabel || 'Low';

    // Actions
    const nextActions = project.playbook_snapshot?.ai_baseline?.nextSteps || [];
    const primaryAction = {
        label: nextActions[0] || "Review Project Details",
        href: `/projects/${project.id}/details`, // Direct link to details
        urgent: true
    };
    const secondaryActions = nextActions.slice(1, 4).map((step: string) => ({
        label: step,
        href: `/projects/${project.id}/roadmap` // Direct link to roadmap
    }));

    // Reference Sections
    const referenceSections = [
        {
            id: 'executive-summary',
            title: 'Executive Summary',
            summary: 'Project goals and target customer',
            icon: '📝',
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Project Summary</h4>
                    </div>
                    <p className="text-sm text-slate-600">{project.summary}</p>
                    {project.targetCustomer && (
                        <div className="mt-4">
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Target Customer</h4>
                            <p className="text-sm text-slate-600">{project.targetCustomer}</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'bom',
            title: 'Bill of Materials',
            summary: `${project.bom.length} components identified`,
            icon: '📦',
            content: project.bom.length > 0 ? <BOMDraft bomItems={project.bom} /> : <p className="text-sm text-slate-500">No BOM data available.</p>
        },
        {
            id: 'certifications',
            title: 'Compliance & Certifications',
            summary: `${project.certifications.length} requirements`,
            icon: '✓',
            content: project.certifications.length > 0 ? <CertificationMap certifications={project.certifications} /> : <p className="text-sm text-slate-500">No certification data available.</p>
        },
        {
            id: 'risks',
            title: 'Risk Analysis',
            summary: 'Manufacturing and business risks',
            icon: '⚠️',
            content: project.riskMap ? <RiskMap riskMap={project.riskMap} /> : <p className="text-sm text-slate-500">No risk data available.</p>
        }
    ];

    return (
        <ProjectShell
            projectId={project.id}
            title={project.productName}
            subtitle={project.description}
            activeView="overview"
            progress={Math.round(projectProgress.percentage)}
            headerActions={
                <div className="flex items-center gap-3">
                    {isNdaSigned && (
                        <div className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 cursor-help">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold">NDA Signed</span>
                        </div>
                    )}
                    <DownloadPDFButton project={project as any} playbookFree={project.playbook_snapshot?.ai_baseline as any} />
                </div>
            }
        >
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

                {/* 1. HERO HEADER */}
                <ProjectHero
                    productName={project.productName}
                    summary={project.summary}
                    currentPhase={projectProgress.currentPhase}
                    progress={projectProgress}
                    imageUrl={project.playbook_snapshot?.wizard_input?.referenceImage} // Use ref image if available
                    targetMarkets={project.playbook_snapshot?.constraints?.markets ? [project.playbook_snapshot.constraints.markets] : []}
                    feasibilityScore={project.feasibility?.overallScore || 0}
                    estimatedMargin={margin}
                    riskLevel={riskLevel}
                />

                {/* 1.2 FEASIBILITY SNAPSHOT */}
                {project.feasibility && (
                    <FeasibilitySnapshot
                        feasibility={project.feasibility}
                        productStyle={project.sourcingMode === 'white-label' ? 'White Label' : project.sourcingMode === 'custom' ? 'Custom Design' : 'Combination'}
                    />
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* 2. ACTION CENTER */}
                    <ActionCenter
                        primaryAction={primaryAction}
                        secondaryActions={secondaryActions}
                        blockers={!isNdaSigned ? [{ message: 'NDA not signed yet', severity: 'warning' }] : []}
                    />

                    {/* 3. PHASE CONTEXT */}
                    <PhaseContextPanel
                        phase={projectProgress.currentPhase}
                        project={project as any}
                    />

                    {/* 4. REFERENCE ACCORDION */}
                    <ReferenceAccordion
                        sections={referenceSections}
                    />

                </div>
            </div>
        </ProjectShell>
    );
}
