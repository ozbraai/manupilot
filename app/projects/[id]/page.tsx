'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Layout
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectShell from '@/components/project/ProjectShell';

// Components
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectKeyInfo from '@/components/project/ProjectKeyInfo';
import ProjectComponents from '@/components/project/ProjectComponents';
import ProjectTimeline from '@/components/project/ProjectTimeline';
import ProjectRisks from '@/components/project/ProjectRisks';
import ProjectApproach from '@/components/project/ProjectApproach';
import ProjectActivity from '@/components/project/ProjectActivity';
import ProjectNotes from '@/components/project/ProjectNotes';
import ProjectPremiumCTA from '@/components/project/ProjectPremiumCTA';
import ProjectCompliance from '@/components/project/ProjectCompliance';
// import PlaybookFinancials from '@/components/playbook/PlaybookFinancials'; // Replaced
import PlaybookBOM from '@/components/playbook/PlaybookBOM';
import ProjectProductSpecs from '@/components/project/ProjectProductSpecs';
import ProjectFinancials from '@/components/project/ProjectFinancials';
import ProjectSamples from '@/components/project/ProjectSamples';

// NEW: Sourcing Component
import RFQBuilder from '@/components/sourcing/RFQBuilder';
import DownloadPDFButton from '@/components/pdf/DownloadPDFButton';

// Types
import { PlaybookV2 } from '@/types/playbook';
import { FeasibilityScores } from '@/lib/feasibility';

// Feasibility
import FeasibilityCard from '@/components/FeasibilityCard';

// NEW: AI Analysis Components (Phase 4)
import OpportunityScore from '@/components/project/OpportunityScore';
import MissingInfoScanner from '@/components/project/MissingInfoScanner';
import ComponentBreakdown from '@/components/project/ComponentBreakdown';
import BOMDraft from '@/components/project/BOMDraft';
import CertificationMap from '@/components/project/CertificationMap';
import IPStrategy from '@/components/project/IPStrategy';
import SupplierAnalysis from '@/components/project/SupplierAnalysis';
import RiskMap from '@/components/project/RiskMap';
import FounderCoaching from '@/components/project/FounderCoaching';

type View = 'overview' | 'bom' | 'financials' | 'roadmap' | 'sourcing' | 'samples';

export default function ProjectWorkspace() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // === STATE ===
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('overview');

    const [project, setProject] = useState<any>(null);
    const [playbook, setPlaybook] = useState<PlaybookV2 | null>(null); // Full PlaybookV2
    const [playbookFree, setPlaybookFree] = useState<any>(null); // Legacy compatibility
    const [completion, setCompletion] = useState<any>({});
    const [activity, setActivity] = useState<any[]>([]);
    const [rfqStatus, setRfqStatus] = useState<any>(null);
    const [feasibility, setFeasibility] = useState<FeasibilityScores | null>(null);
    const [isNdaSigned, setIsNdaSigned] = useState(false);

    // Editable Summary State
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [summaryDraft, setSummaryDraft] = useState('');
    const [targetCustomerDraft, setTargetCustomerDraft] = useState('');

    // === LOAD DATA ===
    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);

            // 1. Supabase Project
            const { data: proj, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !proj) {
                router.push('/dashboard');
                return;
            }
            setProject(proj);

            // Parse feasibility - check both database AND playbook_snapshot
            let feasibilityData = null;

            // First try database feasibility field
            if (proj.feasibility) {
                try {
                    feasibilityData = typeof proj.feasibility === 'string'
                        ? JSON.parse(proj.feasibility)
                        : proj.feasibility;
                } catch (err) {
                    console.error('Error parsing feasibility:', err);
                }
            }

            // If not found, try playbook_snapshot.feasibility
            if (!feasibilityData && proj.playbook_snapshot?.feasibility) {
                try {
                    feasibilityData = typeof proj.playbook_snapshot.feasibility === 'string'
                        ? JSON.parse(proj.playbook_snapshot.feasibility)
                        : proj.playbook_snapshot.feasibility;
                } catch (err) {
                    console.error('Error parsing snapshot feasibility:', err);
                }
            }

            if (feasibilityData) {
                setFeasibility(feasibilityData as FeasibilityScores);
            } else {
                // console.log('No feasibility data found in project or snapshot'); // Removed verbose log
            }

            // 1b. Check RFQ Status
            const { data: rfq } = await supabase
                .from('rfq_submissions')
                .select('status')
                .eq('project_id', id)
                .single();

            if (rfq) setRfqStatus(rfq.status);

            // 1c. Check NDA Status
            try {
                console.log('Fetching NDA status for project view...');
                const ndaRes = await fetch('/api/nda/status', { cache: 'no-store' });
                if (ndaRes.ok) {
                    const ndaData = await ndaRes.json();
                    console.log('NDA Status Response:', ndaData);
                    setIsNdaSigned(ndaData.hasSigned);
                } else {
                    console.error('NDA Status fetch failed:', ndaRes.status);
                }
            } catch (e) {
                console.error('Failed to check NDA status', e);
            }

            // 2. LocalStorage Data
            if (typeof window !== 'undefined') {
                const storedPlaybookStr = window.localStorage.getItem(`manupilot_playbook_project_${id}`);
                if (storedPlaybookStr) {
                    const parsed = JSON.parse(storedPlaybookStr);
                    // Check if it's V2 or legacy
                    if (parsed.free) {
                        // If project has an image_url in the database, use that instead of localStorage
                        if (proj.image_url && (!parsed.free.projectImage || parsed.free.projectImage !== proj.image_url)) {
                            parsed.free.projectImage = proj.image_url;
                        }
                        setPlaybook(parsed as PlaybookV2);
                        setPlaybookFree(parsed.free);
                        setSummaryDraft(parsed.free.summary || '');
                        setTargetCustomerDraft(parsed.free.targetCustomer || '');
                    } else {
                        // Legacy fallback
                        // If project has an image_url in the database, add it to parsed data
                        if (proj.image_url) {
                            parsed.projectImage = proj.image_url;
                        }
                        setPlaybookFree(parsed);
                    }
                }

                const storedRoadmap = window.localStorage.getItem(`manupilot_project_${id}_roadmap`);
                if (storedRoadmap) setCompletion(JSON.parse(storedRoadmap));

                const storedActivity = window.localStorage.getItem(`manupilot_project_${id}_activity`);
                if (storedActivity) setActivity(JSON.parse(storedActivity));
            }
            setLoading(false);
        }
        loadData();
    }, [id, router]);

    // === HANDLERS ===
    function handleNotesUpdate(newNotes: string) {
        if (!playbook) return;
        const updatedFree = { ...playbook.free, notes: newNotes };
        const updatedPlaybook = { ...playbook, free: updatedFree };

        setPlaybook(updatedPlaybook);
        setPlaybookFree(updatedFree);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(`manupilot_playbook_project_${id}`, JSON.stringify(updatedPlaybook));
        }
    }

    function saveSummary() {
        if (!playbook) return;
        const updatedFree = {
            ...playbook.free,
            summary: summaryDraft,
            targetCustomer: targetCustomerDraft
        };
        const updatedPlaybook = { ...playbook, free: updatedFree };

        setPlaybook(updatedPlaybook);
        setPlaybookFree(updatedFree);
        setIsEditingSummary(false);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(`manupilot_playbook_project_${id}`, JSON.stringify(updatedPlaybook));
        }
    }

    // Roadmap Progress Calc
    const roadmapPhases = playbookFree?.roadmapPhases || []; // Fallback for legacy or V2 mapping needed if roadmapPhases moved
    // Note: V2 might not have roadmapPhases in 'free' yet, using legacy logic for now or assuming it's there.
    // If V2 doesn't have roadmapPhases, we might need to generate them or use a default.
    // For this task, we assume they exist or are not the focus of the Overview upgrade.

    let totalTasks = 0;
    let completedTasks = 0;
    // Safe check for roadmapPhases
    (roadmapPhases || []).forEach((phase: any, pIdx: number) => {
        const pId = phase.id || phase.name || `phase_${pIdx}`;
        (phase.tasks || []).forEach((_: any, tIdx: number) => {
            totalTasks++;
            const tId = `${pId}_task_${tIdx}`;
            if (completion[pId]?.[tId]) completedTasks++;
        });
    });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // === HELPER FUNCTIONS ===
    const getProjectStage = (prog: number) => {
        if (prog === 0) return "Not started";
        if (prog <= 30) return "Discovery / Spec";
        if (prog <= 60) return "Sampling / Tooling";
        if (prog <= 90) return "Pre-production";
        return "Production-ready";
    };

    const getRiskLevel = (risks: string[] = []) => {
        if (risks.length <= 2) return "Low";
        if (risks.length <= 5) return "Medium";
        return "High";
    };

    const calculateMargin = (costRange?: string, retailRange?: string) => {
        if (!costRange || !retailRange) return null;
        // Simple parser: take first number found
        const parsePrice = (s: string) => {
            const match = s.match(/\$?([\d,]+)/);
            return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        };
        const cost = parsePrice(costRange);
        const retail = parsePrice(retailRange);
        if (!cost || !retail || retail === 0) return null;
        return Math.round(((retail - cost) / retail) * 100);
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Workspace...</div>;

    // === SUB-VIEWS ===

    const renderOverview = () => {
        if (!playbook) {
            // Fallback for legacy projects without V2 structure
            return (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-500">This project uses an older data format. Some overview features may be unavailable.</p>
                </div>
            );
        }

        const margin = calculateMargin(playbook.costEstimate?.unitCostRange, playbook.costEstimate?.retailRange);
        const riskLevel = getRiskLevel(playbook.free.manufacturingApproach?.risks || []);
        const stage = getProjectStage(progress);

        // Next Actions Logic
        const nextActions = [];
        if (!rfqStatus) nextActions.push("Prepare RFQ and send to suppliers");
        if (playbook.free.nextSteps && playbook.free.nextSteps.length > 0) {
            nextActions.push(...playbook.free.nextSteps.slice(0, 3));
        }
        if (nextActions.length === 0) nextActions.push("Review project details", "Contact manufacturers");

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* 1. PRODUCT IDENTITY CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <span className="text-9xl">🚀</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                        {playbook?.mode === 'white-label' ? 'White Label' : playbook?.mode === 'custom' ? 'Custom Design' : 'Hybrid'}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider border border-sky-100">
                                        {playbook?.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{playbook.productName}</h2>
                                <p className="text-slate-500 text-sm md:text-base max-w-2xl">{playbook.coreProduct}</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Markets</p>
                                <p className="text-sm font-semibold text-slate-700">{playbook.constraints?.markets || 'Global'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FEASIBILITY SNAPSHOT */}
                {feasibility ? (
                    <FeasibilityCard
                        feasibility={feasibility}
                        productStyle={
                            ((feasibility as any).sourcingMode || playbook?.mode) === 'white-label' ? 'White Label' :
                                ((feasibility as any).sourcingMode || playbook?.mode) === 'custom' ? 'Custom' :
                                    ((feasibility as any).sourcingMode || playbook?.mode) === 'combination' ? 'Hybrid' :
                                        undefined
                        }
                        uniquenessFactor={(feasibility as any).uniquenessFactor || (playbook as any)?.uniquenessFactor}
                        uniquenessPoints={
                            (playbook as any)?.differentiationText
                                ? [(playbook as any).differentiationText]
                                : [
                                    playbook?.mode === 'custom' ? 'Custom design with unique specifications.' : 'Standard product with potential for branding.',
                                    !(playbook as any)?.selectedSimilarProductId ? 'No direct similar products identified.' : 'Similar products exist in the market.'
                                ]
                        }
                    />
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                        <p className="text-sm text-slate-500">Feasibility has not been generated for this project yet.</p>
                    </div>
                )}

                {/* 2. SNAPSHOTS ROW */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* PROJECT SNAPSHOT */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">📊</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Project Status</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Current Stage</p>
                                <p className="text-sm font-semibold text-slate-900">{stage}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Completion</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                                    riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700' :
                                        'bg-red-50 text-red-700'
                                    }`}>
                                    {riskLevel}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Launch Goal</p>
                                <p className="text-sm font-semibold text-slate-900">{playbook.constraints?.launchWindow || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    {/* COMMERCIAL SNAPSHOT */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">💰</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Commercials</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Est. Unit Cost</p>
                                <p className="text-sm font-semibold text-slate-900">{playbook.costEstimate?.unitCostRange || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Target Landed</p>
                                <p className="text-sm font-semibold text-slate-700">{playbook.constraints?.maxUnitPrice || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Est. Retail</p>
                                <p className="text-sm font-semibold text-slate-900">{playbook.costEstimate?.retailRange || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Est. Margin</p>
                                {margin ? (
                                    <p className="text-sm font-bold text-emerald-600">~{margin}%</p>
                                ) : (
                                    <p className="text-sm text-slate-400">-</p>
                                )}
                            </div>
                            <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500">MOQ Requirement</p>
                                    <p className="text-sm font-medium text-slate-900">{playbook.costEstimate?.moqRange || playbook.constraints?.moq || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. EXECUTIVE SUMMARY (EDITABLE) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Executive Summary</h3>
                        </div>
                        <button
                            onClick={() => isEditingSummary ? saveSummary() : setIsEditingSummary(true)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${isEditingSummary
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {isEditingSummary ? 'Save Changes' : 'Edit Strategy'}
                        </button>
                    </div>

                    {isEditingSummary ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Project Summary</label>
                                <textarea
                                    value={summaryDraft}
                                    onChange={(e) => setSummaryDraft(e.target.value)}
                                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Customer</label>
                                <input
                                    type="text"
                                    value={targetCustomerDraft}
                                    onChange={(e) => setTargetCustomerDraft(e.target.value)}
                                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {playbook.free.summary || 'No summary defined.'}
                            </p>
                            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-400 text-sm">🎯</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Target Customer</p>
                                    <p className="text-sm text-slate-700">{playbook.free.targetCustomer || 'Not defined'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. NEXT ACTIONS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">⚡</span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Next Actions</h3>
                    </div>
                    <div className="space-y-2">
                        {nextActions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-sky-500 transition-colors" />
                                <span className="text-sm text-slate-700 font-medium">{action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NEW: AI ANALYSIS SECTIONS (Phase 4) */}
                {project?.ai_analysis && (
                    <>
                        {/* Opportunity Score */}
                        {project.ai_analysis.opportunity_score !== undefined && (
                            <OpportunityScore
                                score={project.ai_analysis.opportunity_score}
                                rationale={project.ai_analysis.opportunity_rationale}
                                insights={project.ai_analysis.what_you_might_not_know || []}
                            />
                        )}

                        {/* Missing Info Scanner */}
                        {project.ai_analysis.missing_info_scanner && (
                            <MissingInfoScanner missingInfo={project.ai_analysis.missing_info_scanner} />
                        )}

                        {/* Component Breakdown */}
                        {project.ai_analysis.component_breakdown && project.ai_analysis.component_breakdown.length > 0 && (
                            <ComponentBreakdown components={project.ai_analysis.component_breakdown} />
                        )}

                        {/* BOM Draft */}
                        {project.ai_analysis.bom_draft && project.ai_analysis.bom_draft.length > 0 && (
                            <BOMDraft bomItems={project.ai_analysis.bom_draft} />
                        )}

                        {/* Certifications */}
                        {project.ai_analysis.certifications && project.ai_analysis.certifications.length > 0 && (
                            <CertificationMap certifications={project.ai_analysis.certifications} />
                        )}

                        {/* IP Strategy */}
                        {project.ai_analysis.ip_strategy && (
                            <IPStrategy
                                patentabilitySignals={project.ai_analysis.ip_strategy.patentability_signals || []}
                                copycatRisk={project.ai_analysis.ip_strategy.copycat_risk}
                                copycatRiskExplanation={project.ai_analysis.ip_strategy.copycat_risk_explanation}
                                protectionRecommendations={project.ai_analysis.ip_strategy.protection_recommendations || []}
                            />
                        )}

                        {/* Supplier Analysis */}
                        {project.ai_analysis.supplier_analysis && (
                            <SupplierAnalysis
                                typesRequired={project.ai_analysis.supplier_analysis.types_required || []}
                                supplierShortlist={project.ai_analysis.supplier_analysis.shortlist || []}
                                redFlags={project.ai_analysis.supplier_analysis.red_flags || []}
                                sourcingTips={project.ai_analysis.supplier_analysis.sourcing_tips || []}
                            />
                        )}

                        {/* Risk Map */}
                        {project.ai_analysis.risk_map && (
                            <RiskMap riskMap={project.ai_analysis.risk_map} />
                        )}

                        {/* Founder Coaching */}
                        {project.ai_analysis.founder_coaching && project.ai_analysis.founder_coaching.length > 0 && (
                            <FounderCoaching coachingItems={project.ai_analysis.founder_coaching} />
                        )}
                    </>
                )}

            </div>
        );
    };

    return (
        <ProjectShell
            title={project?.title}
            subtitle="Manage your product development lifecycle."
            activeView={activeView}
            onChangeView={setActiveView}
            rfqStatus={rfqStatus}
            projectImage={playbookFree?.projectImage}
            progress={progress}
            headerActions={
                <div className="flex items-center gap-3">
                    {isNdaSigned && (
                        <div className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 cursor-help">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold">NDA Signed</span>
                            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Your project information is protected by our NDA.
                            </div>
                        </div>
                    )}
                    <DownloadPDFButton project={project} playbookFree={playbookFree} />
                </div>
            }
        >
            {/* DYNAMIC CONTENT SWITCHER */}
            {activeView === 'overview' && renderOverview()}

            {activeView === 'financials' && (
                <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Cost & Pricing</h2>
                        <p className="text-slate-500 text-sm md:text-base">Analyze unit economics, margins, and startup capital requirements.</p>
                    </div>
                    {playbook ? (
                        <ProjectFinancials playbook={playbook} />
                    ) : (
                        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                            <p className="text-slate-500">Loading financial data...</p>
                        </div>
                    )}
                </div>
            )}

            {activeView === 'bom' && (
                <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Product Specifications</h2>
                        <p className="text-slate-500 text-sm md:text-base">Technical breakdown of your product, materials, and components.</p>
                    </div>
                    {playbook ? (
                        <ProjectProductSpecs playbook={playbook} />
                    ) : (
                        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
                            <p className="text-slate-500">Loading product details...</p>
                        </div>
                    )}
                </div>
            )}

            {activeView === 'roadmap' && (
                <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-2xl p-0 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-900">Execution Roadmap</h2>
                            <p className="text-sm text-slate-500">Check off tasks as you complete them to update your project progress.</p>
                        </div>
                        {/* Reusing the modal internal logic but rendered inline */}
                        <InlineRoadmap
                            phases={roadmapPhases}
                            completion={completion}
                            setCompletion={(next: any) => {
                                setCompletion(next);
                                window.localStorage.setItem(`manupilot_project_${id}_roadmap`, JSON.stringify(next));
                            }}
                        />
                    </div>
                </div>
            )}

            {/* NEW: SAMPLES VIEW */}
            {activeView === 'samples' && (
                <ProjectSamples projectId={id} playbook={playbook} />
            )}

            {/* NEW: SOURCING VIEW */}
            {activeView === 'sourcing' && (
                <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Supplier Sourcing</h2>
                        <p className="text-slate-500 text-sm md:text-base">Create a professional RFQ package to get accurate quotes from factories.</p>
                    </div>

                    <RFQBuilder
                        projectId={id}
                        projectTitle={project?.title}
                        sourcingMode={playbookFree?.sourcingMode || 'custom'}
                        bomCount={playbookFree?.bomDraft?.length || 0}
                        // Try to get realistic target price from financials, or empty string
                        targetPrice={playbookFree?.financials?.unitEconomics?.landedCost || playbookFree?.financials?.estimatedLandedCost || ''}
                        // Try to get realistic MOQ from financials
                        targetMoq={playbookFree?.financials?.startupCapital?.firstBatchCost ? 'Calculated from Inventory' : '500 units'}
                        playbook={playbook || undefined} // Pass full playbook
                        onSuccess={() => setRfqStatus('submitted')}
                    />
                </div>
            )}
        </ProjectShell>
    );
}

// === HELPER: INLINE ROADMAP RENDERER ===
function InlineRoadmap({ phases, completion, setCompletion }: any) {
    if (!phases?.length) return <div className="p-8 text-center text-slate-500">No roadmap data found.</div>;

    return (
        <div className="divide-y divide-slate-100">
            {phases.map((phase: any, pIdx: number) => {
                const pId = phase.id || `phase_${pIdx}`;
                return (
                    <div key={pId} className="p-6 hover:bg-slate-50/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                                {pIdx + 1}
                            </div>
                            <h3 className="font-medium text-slate-900">{phase.name}</h3>
                        </div>
                        <div className="pl-9 space-y-2">
                            {phase.tasks?.map((task: string, tIdx: number) => {
                                const tId = `${pId}_task_${tIdx}`;
                                const isDone = completion?.[pId]?.[tId];
                                return (
                                    <label key={tId} className="flex items-start gap-3 cursor-pointer group">
                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isDone ? 'bg-slate-900 border-slate-900' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                                            {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={!!isDone}
                                            onChange={() => {
                                                const next = { ...completion, [pId]: { ...(completion[pId] || {}), [tId]: !isDone } };
                                                setCompletion(next);
                                            }}
                                        />
                                        <span className={`text-sm transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                            {task}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
