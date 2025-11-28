'use client';

import React, { useEffect, useState } from 'react';
import { FeasibilityScores } from '@/lib/feasibility';

interface FeasibilityCardProps {
    feasibility: FeasibilityScores;
    productStyle?: 'Custom' | 'White Label' | 'Hybrid';
    uniquenessPoints?: string[];
    uniquenessFactor?: string;
    showInsights?: boolean;
}

export default function FeasibilityCard({
    feasibility,
    productStyle,
    uniquenessPoints,
    uniquenessFactor,
    showInsights = true
}: FeasibilityCardProps) {
    /* ---------------------------
       COLOUR HELPERS
       --------------------------- */

    // Manufacturability: High = GOOD
    const getManufacturabilityColor = (label: string) => {
        switch (label) {
            case 'High':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Low':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getCompetitionColor = (label: string) => {
        switch (label) {
            case 'Low':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'High':
                return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'Extreme':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getTrendColor = (label: string) => {
        switch (label) {
            case 'Exploding':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Growing':
                return 'bg-sky-50 text-sky-700 border-sky-100';
            case 'Flat':
                return 'bg-slate-50 text-slate-700 border-slate-100';
            case 'Declining':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getRiskColor = (label: string) => {
        switch (label) {
            case 'Low':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'High':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getProductStyleColor = (style?: string) => {
        switch (style) {
            case 'Custom':
                return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'Hybrid':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'White Label':
                return 'bg-slate-50 text-slate-700 border-slate-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getUniquenessLabel = () => {
        if (!uniquenessFactor) return 'Unknown';
        const map: Record<string, string> = {
            'branding_only': 'Branding Only',
            'light_improvements': 'Light Improvements',
            'moderate_innovation': 'Moderate Innovation',
            'highly_unique': 'Highly Unique',
            'category_creating': 'Category Creating'
        };
        return map[uniquenessFactor] || uniquenessFactor;
    };

    /* ---------------------------
       NOTES + UNIQUENESS LISTS
       --------------------------- */

    const collectKeyNotes = (): string[] => {
        const notes: string[] = [];

        if (feasibility.manufacturability.notes.length > 0) {
            notes.push(feasibility.manufacturability.notes[0]);
        }
        if (feasibility.costStructure.notes.length > 0) {
            notes.push(feasibility.costStructure.notes[0]);
        }
        if (feasibility.competition.notes.length > 0) {
            notes.push(feasibility.competition.notes[0]);
        }
        if (feasibility.market.notes.length > 0) {
            notes.push(feasibility.market.notes[0]);
        }
        if (feasibility.risk.notes.length > 0) {
            notes.push(feasibility.risk.notes[0]);
        }

        return notes.slice(0, 6);
    };

    const keyNotes = collectKeyNotes();
    const uniquenessList =
        uniquenessPoints?.length
            ? uniquenessPoints
            : [
                'No detailed differentiation captured yet.',
                'Use the questionnaire to describe logos, design tweaks or extra components.'
            ];

    /* ---------------------------
       RENDER
       --------------------------- */

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">

            {/* HEADER */}
            <div className="flex items-centre gap-2 mb-6">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Feasibility Snapshot
                </h3>
            </div>

            {/* HERO — THREE TOP-ALIGNED COLUMNS */}
            <div className="rounded-2xl bg-slate-50/60 px-6 py-6 mb-6">
                <div className={`grid gap-8 items-start ${showInsights ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>

                    {/* ---------------------------------------------------------
                       COLUMN 1: COMPACT DIAL + CHIPS AROUND IT
                       --------------------------------------------------------- */}
                    <div className="flex flex-col items-center mt-2">

                        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

                            {/* TOP LEFT */}
                            <div className="absolute -top-2 -left-2 text-right">
                                <p className="text-[11px] text-slate-500 mb-0.5">
                                    Manufacturability
                                </p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getManufacturabilityColor(
                                        feasibility.manufacturability.manufacturabilityLabel
                                    )}`}
                                >
                                    {feasibility.manufacturability.manufacturabilityLabel}
                                </span>
                            </div>

                            {/* TOP RIGHT */}
                            <div className="absolute -top-2 -right-2">
                                <p className="text-[11px] text-slate-500 mb-0.5">Competition</p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getCompetitionColor(
                                        feasibility.competition.intensityLabel
                                    )}`}
                                >
                                    {feasibility.competition.intensityLabel}
                                </span>
                            </div>

                            {/* CENTER — DIAL */}
                            <FeasibilityDial score={feasibility.overallScore} />

                            {/* BOTTOM LEFT */}
                            <div className="absolute -bottom-2 -left-2 text-right">
                                <p className="text-[11px] text-slate-500 mb-0.5">Market Trend</p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getTrendColor(
                                        feasibility.market.trendLabel
                                    )}`}
                                >
                                    {feasibility.market.trendLabel}
                                </span>
                            </div>

                            {/* BOTTOM RIGHT */}
                            <div className="absolute -bottom-2 -right-2">
                                <p className="text-[11px] text-slate-500 mb-0.5">Risk Level</p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getRiskColor(
                                        feasibility.risk.riskLabel
                                    )}`}
                                >
                                    {feasibility.risk.riskLabel}
                                </span>
                            </div>
                        </div>

                        {/* SMALL SUBTEXT */}
                        <p className="text-sm text-slate-600 mt-4 text-center max-w-xs">
                            Higher score means easier, cheaper and lower risk to bring to market.
                        </p>
                    </div>

                    {/* ---------------------------------------------------------
                       COLUMN 2: KEY INSIGHTS (OPTIONAL)
                       --------------------------------------------------------- */}
                    {showInsights && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                Key Insights
                            </p>
                            <ul className="space-y-3">
                                <li className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-emerald-600 mb-0.5">Manufacturability</span>
                                    <span>{feasibility.manufacturability.notes[0] || "No specific insights."}</span>
                                </li>
                                <li className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-amber-600 mb-0.5">Competition</span>
                                    <span>{feasibility.competition.notes[0] || "No specific insights."}</span>
                                </li>
                                <li className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-sky-600 mb-0.5">Market Trend</span>
                                    <span>{feasibility.market.notes[0] || "No specific insights."}</span>
                                </li>
                                <li className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wide text-rose-600 mb-0.5">Risk Level</span>
                                    <span>{feasibility.risk.notes[0] || "No specific insights."}</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* ---------------------------------------------------------
                       COLUMN 3: PRODUCT STYLE + UNIQUENESS
                       --------------------------------------------------------- */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Product Style
                        </p>

                        <div className="mb-3">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getProductStyleColor(
                                    productStyle
                                )}`}
                            >
                                {productStyle ?? 'Not specified'}
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-1 font-medium">
                            Uniqueness factor:{' '}
                            <span className="font-semibold text-slate-800">
                                {getUniquenessLabel()}
                            </span>
                        </p>

                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            {uniquenessList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-slate-400 mt-0.5">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------------
               REGION RECOMMENDATION CARD
               --------------------------------------------------------- */}
            {feasibility.regions.mainRegion && (
                <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                        Recommended Manufacturing Region
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
                            {feasibility.regions.mainRegion}
                        </span>
                        {feasibility.regions.alternatives.length > 0 && (
                            <>
                                <span className="text-xs text-slate-400">Alternatives:</span>
                                {feasibility.regions.alternatives.map((alt, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                                    >
                                        {alt.region}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ===========================================
   CIRCULAR GAUGE DIAL
   =========================================== */
function FeasibilityDial({ score }: { score: number }) {
    const safeScore = Math.max(0, Math.min(100, score));
    const size = 140;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const [offset, setOffset] = useState(circumference);

    const progress = circumference * (safeScore / 100);
    const targetOffset = circumference - progress;

    useEffect(() => {
        setOffset(targetOffset);
    }, [targetOffset]);

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#dialGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{safeScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
            </div>
        </div>
    );
}