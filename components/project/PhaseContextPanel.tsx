import React from 'react';
import { ProjectPhase } from '@/types/project';
import Link from 'next/link';

type PhaseContextPanelProps = {
    phase: ProjectPhase;
    project: any; // Using any for flexibility with the complex project object
};

export default function PhaseContextPanel({ phase, project }: PhaseContextPanelProps) {

    // === 1. SUPPLIER SEARCH / SELECTION ===
    if (phase === 'supplier_sourcing') {
        const supplierAnalysis = project?.ai_analysis?.supplier_analysis;
        const shortlist = supplierAnalysis?.shortlist || [];

        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Supplier Shortlist Strategy</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                        {shortlist.length} Candidates Identified
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-slate-500 mb-4">
                            Based on your product requirements, we've identified the ideal supplier profiles.
                            Focus your search on these regions and capabilities.
                        </p>
                        <div className="space-y-3">
                            {shortlist.slice(0, 2).map((lead: any, idx: number) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🏭</span>
                                        <p className="font-semibold text-slate-900 text-sm">{lead.type}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{lead.approach}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Negotiation Tips</h4>
                        <ul className="space-y-2">
                            {(supplierAnalysis?.sourcing_tips || []).slice(0, 3).map((tip: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // === 2. SAMPLING ===
    if (phase === 'sampling') {
        const qcChecklist = project?.ai_analysis?.quality_assurance?.qc_checklist || [];

        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Sample Review Checklist</h3>
                    <Link href={`/projects/${project.id}?view=samples`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        Manage Samples &rarr;
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {qcChecklist.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">{item.importance}</span>
                                <span className="text-slate-300">#{idx + 1}</span>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm mb-1">{item.inspection_point}</p>
                            <p className="text-xs text-slate-500">{item.what_to_check}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // === 3. PRE-PRODUCTION / PRODUCTION ===
    if (phase === 'pre_production' || phase === 'production') {
        const risks = project?.ai_analysis?.risk_map?.manufacturing_risks || [];

        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚠️</span>
                    <h3 className="text-lg font-bold text-slate-900">Production Watchlist</h3>
                </div>

                <div className="space-y-3">
                    {risks.slice(0, 3).map((risk: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{risk.risk}</p>
                                <p className="text-xs text-slate-600 mt-0.5">Mitigation: {risk.mitigation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // === DEFAULT / DISCOVERY ===
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Getting Started</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        You are in the discovery phase. The most important goal right now is to validate your product concept and estimate costs before reaching out to suppliers.
                    </p>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">Market Research</span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">Cost Estimation</span>
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Did you know?</p>
                    <p className="text-sm text-slate-700 italic">
                        "Spending 10% more time on your spec sheet can save you 30% of time in sampling iterations."
                    </p>
                </div>
            </div>
        </div>
    );
}
