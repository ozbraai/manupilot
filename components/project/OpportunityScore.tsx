// components/project/OpportunityScore.tsx
'use client';

import React from 'react';

type OpportunityScoreProps = {
    score: number; // 0-100
    rationale: string;
    insights: string[];
};

export default function OpportunityScore({ score, rationale, insights }: OpportunityScoreProps) {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 75) return 'High Potential';
        if (score >= 50) return 'Moderate Potential';
        return 'Challenging';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        🎯 Opportunity Assessment
                    </h3>
                    <p className="text-sm text-slate-600">{rationale}</p>
                </div>
                <div className={`ml-6 flex flex-col items-center justify-center w-28 h-28 rounded-2xl border-2 ${getScoreColor(score)}`}>
                    <div className="text-4xl font-bold">{score}</div>
                    <div className="text-xs font-medium mt-1">{getScoreLabel(score)}</div>
                </div>
            </div>

            {insights && insights.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">💡 What You Might Not Know</h4>
                    <ul className="space-y-2">
                        {insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-sky-500 mt-0.5">→</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
