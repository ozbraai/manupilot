'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Layout
import ProjectSidebar from '@/components/project/ProjectSidebar';

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
import PlaybookFinancials from '@/components/playbook/PlaybookFinancials';
import PlaybookBOM from '@/components/playbook/PlaybookBOM';

// NEW: Sourcing Component
import RFQBuilder from '@/components/sourcing/RFQBuilder';
import DownloadPDFButton from '@/components/pdf/DownloadPDFButton';

type View = 'overview' | 'bom' | 'financials' | 'roadmap' | 'sourcing';

export default function ProjectWorkspace() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // === STATE ===
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('overview');

    const [project, setProject] = useState<any>(null);
    const [playbookFree, setPlaybookFree] = useState<any>(null);
    const [completion, setCompletion] = useState<any>({});
    const [activity, setActivity] = useState<any[]>([]);
    const [rfqStatus, setRfqStatus] = useState<any>(null); // New State

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

            // 1b. Check RFQ Status
            const { data: rfq } = await supabase
                .from('rfq_submissions')
                .select('status')
                .eq('project_id', id)
                .single();

            if (rfq) setRfqStatus(rfq.status);

            // 2. LocalStorage Data
            if (typeof window !== 'undefined') {
                const storedPlaybook = window.localStorage.getItem(`manupilot_playbook_project_${id}`);
                if (storedPlaybook) setPlaybookFree(JSON.parse(storedPlaybook).free || {});

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
        const updatedFree = { ...playbookFree, notes: newNotes };
        setPlaybookFree(updatedFree);
        if (typeof window !== 'undefined') {
            const currentStored = JSON.parse(window.localStorage.getItem(`manupilot_playbook_project_${id}`) || '{}');
            window.localStorage.setItem(`manupilot_playbook_project_${id}`, JSON.stringify({ ...currentStored, free: updatedFree }));
        }
    }

    // Roadmap Progress Calc
    const roadmapPhases = playbookFree?.roadmapPhases || [];
    let totalTasks = 0;
    let completedTasks = 0;
    roadmapPhases.forEach((phase: any, pIdx: number) => {
        const pId = phase.id || phase.name || `phase_${pIdx}`;
        (phase.tasks || []).forEach((_: any, tIdx: number) => {
            totalTasks++;
            const tId = `${pId}_task_${tIdx}`;
            if (completion[pId]?.[tId]) completedTasks++;
        });
    });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Workspace...</div>;

    // === SUB-VIEWS ===

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">📝</span>
                        <h2 className="text-lg font-bold text-slate-900">Executive Summary</h2>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{playbookFree?.summary || 'No summary available yet.'}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <ProjectTimeline timeline={playbookFree?.timeline} />
                    <ProjectKeyInfo
                        project={project}
                        keyInfo={{ category: playbookFree?.category, sourcingMode: playbookFree?.sourcingMode }}
                        free={playbookFree}
                        onUpdate={(k, v) => {
                            const updated = { ...playbookFree, [k]: v };
                            setPlaybookFree(updated);
                            if (typeof window !== 'undefined') {
                                const currentStored = JSON.parse(window.localStorage.getItem(`manupilot_playbook_project_${id}`) || '{}');
                                window.localStorage.setItem(`manupilot_playbook_project_${id}`, JSON.stringify({ ...currentStored, free: updated }));
                            }
                        }}
                    />
                </div>

                <ProjectRisks
                    risks={playbookFree?.manufacturingApproach?.risks}
                    dfmWarnings={playbookFree?.manufacturingApproach?.dfmWarnings}
                />
                <ProjectPremiumCTA />
            </div>

            {/* Side Feed */}
            <div className="space-y-6">
                <ProjectActivity projectId={id} activity={activity} setActivity={setActivity} />
                <ProjectNotes notes={playbookFree?.notes} onUpdate={handleNotesUpdate} />
                <ProjectCompliance tasks={playbookFree?.manufacturingApproach?.complianceTasks} market={playbookFree?.targetMarket} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 flex">

            {/* === MOBILE OVERLAY === */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* === 1. LEFT SIDEBAR === */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <ProjectSidebar
                    activeView={activeView}
                    onChangeView={(view) => {
                        setActiveView(view);
                        setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    title={project?.title}
                    rfqStatus={rfqStatus}
                />
            </div>

            {/* === 2. MAIN CONTENT AREA === */}
            <main className="flex-1 w-full p-4 md:p-8 lg:p-12">

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-zinc-200 rounded-lg shadow-sm"
                >
                    <svg className="w-6 h-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Top Header */}
                <div className="mb-10 mt-12 lg:mt-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            {/* Blueprint Thumbnail */}
                            {playbookFree?.projectImage && (
                                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={playbookFree.projectImage}
                                        alt={`${project?.title} thumbnail`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{project?.title}</h1>
                                <p className="text-slate-500 mt-2 text-sm md:text-base">Manage your product development lifecycle.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 md:items-end">
                            <DownloadPDFButton project={project} playbookFree={playbookFree} />
                            <div className="text-left md:text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roadmap Progress</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-full md:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">{progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-200 w-full" />
                </div>

                {/* DYNAMIC CONTENT SWITCHER */}
                {activeView === 'overview' && renderOverview()}

                {activeView === 'financials' && (
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PlaybookFinancials financials={playbookFree?.financials} />
                    </div>
                )}

                {activeView === 'bom' && (
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <PlaybookBOM bom={playbookFree?.bomDraft} />
                        <ProjectComponents free={playbookFree} />
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
                            onSuccess={() => setRfqStatus('submitted')}
                        />
                    </div>
                )}

            </main>
        </div>
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