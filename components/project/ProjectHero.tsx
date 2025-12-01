import React from 'react';
import { ProjectPhase } from '@/types/project';
import ProgressIndicator from './ProgressIndicator';
import { ProgressResult } from '@/lib/progress';

type ProjectHeroProps = {
    productName: string;
    summary: string;
    currentPhase: ProjectPhase;
    progress: ProgressResult;
    imageUrl?: string;
    targetMarkets: string[];
    // Metrics Props
    feasibilityScore?: number;
    estimatedMargin?: number | null;
    riskLevel?: 'Low' | 'Medium' | 'High';
};

export default function ProjectHero({
    productName,
    summary,
    currentPhase,
    progress,
    imageUrl,
    targetMarkets,
    feasibilityScore,
    estimatedMargin,
    riskLevel
}: ProjectHeroProps) {
    return (
        <div className="relative bg-white border-b border-slate-200 overflow-hidden">
            {/* Background Image/Texture */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-100" />
                )}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Left: Product Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {productName}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                {currentPhase.replace('-', ' ')}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base max-w-2xl line-clamp-2">
                            {summary}
                        </p>
                        {targetMarkets.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                <span className="font-medium uppercase tracking-wider">Markets:</span>
                                <span>{targetMarkets.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Phase Progress */}
                    <div className="w-full md:w-auto min-w-[300px]">
                        <ProgressIndicator progress={progress} variant="compact" />
                    </div>
                </div>
            </div>

            {/* Bottom Metrics Bar (Fixed in Hero) */}
            {(feasibilityScore !== undefined || estimatedMargin !== undefined || riskLevel) && (
                <div className="border-t border-slate-200 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-8 text-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                                Project Reference
                            </span>

                            {/* Feasibility */}
                            {feasibilityScore !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feasibility</span>
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${feasibilityScore >= 70 ? 'bg-emerald-500' : feasibilityScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${feasibilityScore}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-slate-900">{feasibilityScore}/100</span>
                                </div>
                            )}

                            {/* Margin */}
                            {estimatedMargin !== undefined && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Margin</span>
                                    <span className={`font-bold ${estimatedMargin && estimatedMargin > 50 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {estimatedMargin ? `~${estimatedMargin}%` : '-'}
                                    </span>
                                </div>
                            )}

                            {/* Risk */}
                            {riskLevel && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Level</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {riskLevel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
