import React from 'react';
import { FeasibilityScores } from '@/lib/feasibility';

type FeasibilitySnapshotProps = {
    feasibility: FeasibilityScores;
    productStyle?: string;
};

export default function FeasibilitySnapshot({ feasibility, productStyle }: FeasibilitySnapshotProps) {
    const { overallScore, manufacturability, competition, market, risk } = feasibility;

    // Helper for score color
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreStroke = (score: number) => {
        if (score >= 70) return 'stroke-emerald-500';
        if (score >= 50) return 'stroke-amber-500';
        return 'stroke-red-500';
    };

    // Helper for indicator badges
    const getBadgeColor = (type: 'good' | 'neutral' | 'bad') => {
        switch (type) {
            case 'good': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'neutral': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'bad': return 'bg-red-50 text-red-700 border-red-100';
        }
    };

    // Determine badge types based on labels/scores
    const manufacturabilityType = manufacturability.manufacturabilityLabel === 'High' ? 'good' : manufacturability.manufacturabilityLabel === 'Medium' ? 'neutral' : 'bad';

    // Competition: Low is good, High is bad
    const competitionType = competition.intensityLabel === 'Low' ? 'good' : competition.intensityLabel === 'Medium' ? 'neutral' : 'bad';

    // Market: Growing/Exploding is good, Flat neutral, Declining bad
    const marketType = (market.trendLabel === 'Growing' || market.trendLabel === 'Exploding') ? 'good' : market.trendLabel === 'Flat' ? 'neutral' : 'bad';

    // Risk: Low is good
    const riskType = risk.riskLabel === 'Low' ? 'good' : risk.riskLabel === 'Medium' ? 'neutral' : 'bad';

    // Circular Progress Math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (overallScore / 100) * circumference;

    return (
        <div className="w-full bg-white border-b border-slate-200 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

                    {/* 1. SCORE DIAL */}
                    <div className="flex items-center gap-4 min-w-[180px]">
                        <div className="relative w-20 h-20 flex-shrink-0">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    className="text-slate-100"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className={`${getScoreStroke(overallScore)} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                                    {overallScore}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase">Score</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Feasibility</h3>
                            <p className="text-xs text-slate-500 mt-0.5">AI Viability Assessment</p>
                            {productStyle && (
                                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                                    {productStyle}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 2. KEY INDICATORS (Grid) */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">

                        {/* Manufacturability */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturability</span>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border w-fit ${getBadgeColor(manufacturabilityType)}`}>
                                {manufacturability.manufacturabilityLabel}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                {manufacturability.notes?.[0] || "Based on component complexity"}
                            </p>
                        </div>

                        {/* Competition */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competition</span>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border w-fit ${getBadgeColor(competitionType)}`}>
                                {competition.intensityLabel}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                {competition.notes?.[0] || "Based on market density"}
                            </p>
                        </div>

                        {/* Market Trend */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Trend</span>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border w-fit ${getBadgeColor(marketType)}`}>
                                {market.trendLabel}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                {market.notes?.[0] || "Based on search volume"}
                            </p>
                        </div>

                        {/* Risk Level */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</span>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border w-fit ${getBadgeColor(riskType)}`}>
                                {risk.riskLabel}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                {risk.notes?.[0] || "Overall project risk"}
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
