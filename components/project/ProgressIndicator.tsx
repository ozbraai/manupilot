import React from 'react';
import { ProgressResult, PHASE_CONFIG } from '@/lib/progress';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
    progress: ProgressResult;
    variant: 'compact' | 'detailed';
}

export default function ProgressIndicator({ progress, variant }: ProgressIndicatorProps) {
    const { currentPhase, percentage, phaseProgress, currentMilestone, blockers } = progress;
    const currentPhaseConfig = PHASE_CONFIG[currentPhase];

    // Find the current milestone label
    const currentMilestoneData = phaseProgress
        .flatMap(p => p.milestones)
        .find(m => m.key === currentMilestone);

    if (variant === 'compact') {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {currentPhaseConfig.label}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">
                            {Math.round(percentage)}% Complete
                        </span>
                    </div>
                    {currentMilestoneData?.waiting && (
                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {currentMilestoneData.waitingLabel}
                        </span>
                    )}
                </div>

                {/* Segmented Progress Bar */}
                <div className="flex gap-1 h-2 w-full">
                    {phaseProgress.map((phase, idx) => {
                        const isCompleted = phase.earned === phase.total;
                        const isCurrent = phase.phase === currentPhase;
                        const fillPercent = (phase.earned / phase.total) * 100;

                        return (
                            <div key={phase.phase} className="flex-1 bg-slate-100 rounded-full overflow-hidden relative first:rounded-l-full last:rounded-r-full">
                                <div
                                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' :
                                            isCurrent ? 'bg-slate-900' : 'bg-slate-200'
                                        }`}
                                    style={{ width: isCompleted ? '100%' : isCurrent ? `${fillPercent}%` : '0%' }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Current Action / Blocker */}
                <div className="mt-2 text-xs">
                    {blockers.length > 0 ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {blockers[0]}
                        </span>
                    ) : (
                        <span className="text-slate-500">
                            Next: {currentMilestoneData?.label || 'Complete current phase'}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Detailed View
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Project Progress</h3>
                <span className="text-sm font-bold text-slate-900">{Math.round(percentage)}/100</span>
            </div>

            <div className="divide-y divide-slate-100">
                {phaseProgress.map((phase) => (
                    <div key={phase.phase} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${phase.phase === currentPhase ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                {PHASE_CONFIG[phase.phase].label}
                            </h4>
                            <span className="text-xs font-medium text-slate-400">
                                {phase.earned}/{phase.total}
                            </span>
                        </div>

                        <div className="space-y-3 pl-1">
                            {phase.milestones.map((milestone) => (
                                <div key={milestone.key} className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {milestone.completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : milestone.key === currentMilestone ? (
                                            <div className="relative">
                                                <Circle className="w-4 h-4 text-slate-900 fill-slate-900" />
                                                <div className="absolute inset-0 animate-ping rounded-full bg-slate-400 opacity-20"></div>
                                            </div>
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${milestone.completed ? 'text-slate-700 line-through decoration-slate-300' :
                                                milestone.key === currentMilestone ? 'text-slate-900 font-medium' :
                                                    'text-slate-400'
                                            }`}>
                                            {milestone.label}
                                        </p>
                                        {milestone.waiting && (
                                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {milestone.waitingLabel}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
