'use client';

import React from 'react';
import { FeasibilityScores } from '@/lib/feasibility';

interface PlaybookInsightsProps {
    feasibility: FeasibilityScores;
}

export default function PlaybookInsights({ feasibility }: PlaybookInsightsProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Key Insights
                </h3>
            </div>

            <ul className="space-y-5 flex-1">
                <li className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-emerald-600 mb-1">
                        Manufacturability
                    </span>
                    <span className="leading-relaxed">
                        {feasibility.manufacturability.notes[0] || "No specific insights."}
                    </span>
                </li>
                <li className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-amber-600 mb-1">
                        Competition
                    </span>
                    <span className="leading-relaxed">
                        {feasibility.competition.notes[0] || "No specific insights."}
                    </span>
                </li>
                <li className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-sky-600 mb-1">
                        Market Trend
                    </span>
                    <span className="leading-relaxed">
                        {feasibility.market.notes[0] || "No specific insights."}
                    </span>
                </li>
                <li className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-rose-600 mb-1">
                        Risk Level
                    </span>
                    <span className="leading-relaxed">
                        {feasibility.risk.notes[0] || "No specific insights."}
                    </span>
                </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic text-center">
                    A deeper breakdown unlocks in your project.
                </p>
            </div>
        </div>
    );
}
