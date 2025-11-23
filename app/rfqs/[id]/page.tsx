'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function RFQDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [rfq, setRfq] = useState<any>(null);
    const [project, setProject] = useState<any>(null);
    const [playbook, setPlaybook] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRFQ() {
            if (!id) return;

            // Fetch RFQ with project info
            const { data, error } = await supabase
                .from('rfq_submissions')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error('Error loading RFQ:', error);
                setLoading(false);
                return;
            }

            setRfq(data);
            setProject(data.project);

            // Load playbook data from localStorage
            if (typeof window !== 'undefined' && data.project_id) {
                const stored = window.localStorage.getItem(`manupilot_playbook_project_${data.project_id}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setPlaybook(parsed.free || parsed);
                }
            }

            setLoading(false);
        }

        loadRFQ();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Loading RFQ...</p>
            </div>
        );
    }

    if (!rfq || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-700 font-medium mb-2">RFQ not found</p>
                    <button onClick={() => router.push('/rfqs')} className="text-sm text-blue-600 hover:underline">
                        ← Back to RFQs
                    </button>
                </div>
            </div>
        );
    }

    const rfqData = rfq.rfq_data || {};
    const matchCount = rfqData.matched_partner_ids?.length || 0;

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
            <div className="max-w-6xl mx-auto px-4">

                {/* Back Button */}
                <button
                    onClick={() => router.push('/rfqs')}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to RFQs
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                            {playbook?.projectImage && (
                                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900">
                                    <img
                                        src={playbook.projectImage}
                                        alt={`${project.title} thumbnail`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">REQUEST FOR QUOTE</p>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{project.title}</h1>
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(rfq.status)}`}>
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {rfq.status === 'submitted' ? 'Ready for Sourcing' : rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                        </span>
                    </div>

                    {(project.description || playbook?.summary) && (
                        <p className="text-slate-600 text-base max-w-3xl">{project.description || playbook?.summary}</p>
                    )}

                    {matchCount > 0 && (
                        <div className="mt-6 flex items-center gap-2 text-sm">
                            <div className="flex -space-x-2">
                                {[...Array(Math.min(matchCount, 3))].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <span className="text-emerald-700 font-medium">{matchCount} Verified Supplier{matchCount > 1 ? 's' : ''} Matched</span>
                        </div>
                    )}
                </div>

                {/* Key Requirements Grid */}
                <div className="grid md:grid-cols-3 gap-5 mb-6">

                    {/* MOQ */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target MOQ</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{rfqData.targetMoq || '500'} units</p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Timeline</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{playbook?.timeline?.totalDuration || '8-12 weeks'}</p>
                    </div>

                    {/* Target Price */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Price</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-600">{rfqData.targetPrice || 'TBA'}</p>
                        <p className="text-xs text-slate-500 mt-1">Open to competitive proposals</p>
                    </div>
                </div>

                {/* Specs Grid */}
                <div className="grid md:grid-cols-2 gap-5 mb-6">

                    {/* Materials */}
                    {playbook?.materials && playbook.materials.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Material Specifications</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {playbook.materials.map((material: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                                        {material}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Target Customer */}
                    {playbook?.targetCustomer && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Target Market</h3>
                            </div>
                            <p className="text-slate-700">{playbook.targetCustomer}</p>
                            {playbook.manufacturingRegions && (
                                <p className="text-sm text-slate-600 mt-2">Markets: {playbook.manufacturingRegions.join(', ')}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* BOM Table */}
                {playbook?.bomDraft && playbook.bomDraft.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Bill of Materials ({playbook.bomDraft.length} components)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Component</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Material</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Process</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playbook.bomDraft.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-sm font-medium text-slate-900">{item.partName || item.name || item.component}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{item.material || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{item.process || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-center text-slate-600">{item.qty || item.quantity || 1}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manufacturing Requirements */}
                {playbook?.manufacturingApproach && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Manufacturing Requirements</h3>

                        {playbook.manufacturingApproach.approach && playbook.manufacturingApproach.approach.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommended Approach:</h4>
                                <ul className="space-y-2">
                                    {playbook.manufacturingApproach.approach.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {playbook.manufacturingApproach.dfmWarnings && playbook.manufacturingApproach.dfmWarnings.length > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                <h4 className="text-sm font-semibold text-amber-900 mb-2">DFM Considerations:</h4>
                                <ul className="space-y-1">
                                    {playbook.manufacturingApproach.dfmWarnings.map((warning: string, idx: number) => (
                                        <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                                            <span>⚠</span>
                                            <span>{warning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Compliance Requirements */}
                {playbook?.manufacturingApproach?.complianceTasks && playbook.manufacturingApproach.complianceTasks.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance & Certifications Required</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {playbook.manufacturingApproach.complianceTasks.map((task: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-900">{task}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                {playbook?.timeline && Array.isArray(playbook.timeline) && playbook.timeline.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Timeline</h3>
                        <div className="space-y-3">
                            {playbook.timeline.map((milestone: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-sm font-medium text-slate-900">{typeof milestone === 'string' ? milestone : milestone.phase || milestone.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vetting Questions */}
                {rfqData.questions && rfqData.questions.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-indigo-100 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Supplier Vetting Questions</h3>
                        <p className="text-sm text-slate-600 mb-4">Please address the following in your proposal:</p>
                        <ol className="space-y-2">
                            {rfqData.questions.map((q: string, idx: number) => (
                                <li key={idx} className="flex gap-3">
                                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                                    <span className="text-slate-700">{q}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Branding Requirements (White Label) */}
                {rfqData.sourcingMode === 'white-label' && (rfqData.includeLogo || rfqData.includePackaging) && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Branding Requirements</h3>
                        <div className="space-y-2">
                            {rfqData.includeLogo && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-slate-700">Logo printing on product (Silkscreen/Laser engraving)</span>
                                </div>
                            )}
                            {rfqData.includePackaging && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-slate-700">Custom branded color box packaging (4C offset printing)</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="bg-slate-900 rounded-2xl p-8 text-center">
                    <div className="mb-4">
                        <p className="text-slate-300 text-sm mb-2">Interested in this project?</p>
                        <p className="text-slate-400 text-xs">Submit your detailed proposal including pricing, lead times, and capabilities</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                        Submit Proposal
                    </button>
                </div>

            </div>
        </main>
    );
}
