// components/project/RiskMap.tsx
'use client';

import React from 'react';
import type { RiskAnalysis } from '@/types/project';

type RiskMapProps = {
    riskMap: RiskAnalysis;
};

export default function RiskMap({ riskMap }: RiskMapProps) {
    if (!riskMap) return null;

    const getRiskBadge = (likelihood: string, impact: string) => {
        const score = (likelihood === 'high' ? 3 : likelihood === 'medium' ? 2 : 1) *
            (impact === 'high' ? 3 : impact === 'medium' ? 2 : 1);

        if (score >= 6) return 'bg-red-100 text-red-700 border-red-200';
        if (score >= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const RiskCard = ({ risk, likelihood, impact, mitigation }: any) => (
        <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-900 flex-1">{risk}</h4>
                <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getRiskBadge(likelihood, impact)}`}>
                    {likelihood}/{impact}
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-1">Mitigation:</p>
                <p className="text-sm text-slate-700">{mitigation}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                ⚠️ Risk Map
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Business Risks */}
                {riskMap.business_risks && riskMap.business_risks.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            💼 Business Risks
                        </h4>
                        <div className="space-y-3">
                            {riskMap.business_risks.map((risk, idx) => (
                                <RiskCard key={idx} {...risk} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Manufacturing Risks */}
                {riskMap.manufacturing_risks && riskMap.manufacturing_risks.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            🏭 Manufacturing Risks
                        </h4>
                        <div className="space-y-3">
                            {riskMap.manufacturing_risks.map((risk, idx) => (
                                <RiskCard key={idx} {...risk} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="font-medium">Risk scores:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">Low</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">Medium</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">High</span>
                </p>
            </div>
        </div>
    );
}
