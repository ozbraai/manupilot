// components/project/SupplierAnalysis.tsx
'use client';

import React from 'react';
import type { SupplierLead } from '@/types/project';

type SupplierAnalysisProps = {
    typesRequired: string[];
    supplierShortlist: SupplierLead[];
    redFlags: string[];
    sourcingTips: string[];
};

export default function SupplierAnalysis({
    typesRequired,
    supplierShortlist,
    redFlags,
    sourcingTips
}: SupplierAnalysisProps) {
    if (!supplierShortlist || supplierShortlist.length === 0) {
        return null;
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                🏭 Supplier Analysis & Shortlist
            </h3>

            {typesRequired && typesRequired.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {typesRequired.map((type, idx) => (
                        <span key={idx} className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full border border-sky-200">
                            {type}
                        </span>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                {supplierShortlist.map((supplier, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-slate-900">{supplier.type}</h4>
                            <span className="text-xs text-slate-500">{supplier.typical_moq}</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs font-medium text-slate-600 mb-1">Recommended Regions</p>
                                <p className="text-slate-700">{supplier.recommended_regions.join(', ')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600 mb-1">Approach</p>
                                <p className="text-slate-700">{supplier.approach}</p>
                            </div>
                        </div>

                        {supplier.what_to_ask && supplier.what_to_ask.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs font-medium text-slate-600 mb-2">Key Questions to Ask:</p>
                                <ul className="space-y-1">
                                    {supplier.what_to_ask.map((question, qIdx) => (
                                        <li key={qIdx} className="text-xs text-slate-600 flex items-start gap-2">
                                            <span className="text-sky-500">?</span>
                                            <span>{question}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
                {redFlags && redFlags.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-bold text-red-900 mb-2">🚩 Red Flags to Watch</p>
                        <ul className="space-y-1">
                            {redFlags.map((flag, idx) => (
                                <li key={idx} className="text-xs text-red-700">{flag}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {sourcingTips && sourcingTips.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs font-bold text-emerald-900 mb-2">💡 Sourcing Tips</p>
                        <ul className="space-y-1">
                            {sourcingTips.map((tip, idx) => (
                                <li key={idx} className="text-xs text-emerald-700">{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
