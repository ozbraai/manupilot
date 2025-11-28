// components/project/IPStrategy.tsx
'use client';

import React from 'react';

type IPStrategyProps = {
    patentabilitySignals: string[];
    copycatRisk: 'low' | 'medium' | 'high';
    copycatRiskExplanation: string;
    protectionRecommendations: string[];
};

export default function IPStrategy({
    patentabilitySignals,
    copycatRisk,
    copycatRiskExplanation,
    protectionRecommendations
}: IPStrategyProps) {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                🔐 IP & Protection Strategy
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Copycat Risk Assessment */}
                <div>
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-600 uppercase">Copycat Risk</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(copycatRisk)}`}>
                                {copycatRisk}
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">{copycatRiskExplanation}</p>
                    </div>

                    {patentabilitySignals && patentabilitySignals.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Patentability Signals</p>
                            <ul className="space-y-1">
                                {patentabilitySignals.map((signal, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-sky-500 mt-0.5">✓</span>
                                        <span>{signal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Protection Recommendations */}
                {protectionRecommendations && protectionRecommendations.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-3">Protection Recommendations</p>
                        <ul className="space-y-2">
                            {protectionRecommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-slate-400 mt-1 text-xs">→</span>
                                    <span className="text-sm text-slate-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
