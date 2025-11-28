// components/playbook/ProjectCreationModal.tsx
'use client';

import React from 'react';

type ProjectCreationStep = 'snapshot' | 'analysis' | 'saving' | 'complete';

type ProjectCreationModalProps = {
    isOpen: boolean;
    currentStep: ProjectCreationStep;
    progress: number; // 0-100
};

const STEP_INFO = {
    snapshot: {
        title: '📸 Creating Playbook Snapshot',
        description: 'Freezing your playbook state...',
        items: ['AI baseline estimates', 'Your financial model', 'Final edits', 'Feasibility data'],
        emoji: '⚡',
    },
    analysis: {
        title: '🧠 Generating Manufacturing Intelligence',
        description: 'Our AI is analyzing your product...',
        items: [
            '🎯 Opportunity assessment',
            '🧩 Component breakdown',
            '📋 Bill of materials',
            '🏅 Certification requirements',
            '🔐 IP protection strategy',
            '🏭 Supplier recommendations',
            '⚠️ Risk analysis',
            '📈 Break-even calculation',
            '💬 Founder coaching insights',
        ],
        emoji: '🚀',
    },
    saving: {
        title: '💾 Saving Your Project',
        description: 'Almost there...',
        items: ['Storing snapshot', 'Storing AI analysis', 'Creating project workspace'],
        emoji: '✨',
    },
    complete: {
        title: '✅ Project Created!',
        description: 'Redirecting to your new project...',
        items: [],
        emoji: '🎉',
    },
};

export default function ProjectCreationModal({ isOpen, currentStep, progress }: ProjectCreationModalProps) {
    if (!isOpen) return null;

    const stepInfo = STEP_INFO[currentStep];
    const isAnalysisStep = currentStep === 'analysis';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent_50%)]" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-6xl mb-3 animate-bounce">{stepInfo.emoji}</div>
                        <h2 className="text-2xl font-bold mb-2">{stepInfo.title}</h2>
                        <p className="text-sky-100 text-sm">{stepInfo.description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-8 pt-6">
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500 font-medium">{Math.round(progress)}%</span>
                        <span className="text-xs text-slate-500">
                            {currentStep === 'analysis' ? 'This may take 20-30 seconds' : 'Almost there!'}
                        </span>
                    </div>
                </div>

                {/* Step Items */}
                {stepInfo.items.length > 0 && (
                    <div className="px-8 py-6 space-y-2 max-h-64 overflow-y-auto">
                        {stepInfo.items.map((item, idx) => {
                            const itemProgress = currentStep === 'analysis'
                                ? (progress / stepInfo.items.length) * (idx + 1)
                                : progress;
                            const isCompleted = itemProgress >= (100 / stepInfo.items.length) * idx;
                            const isActive = itemProgress >= (100 / stepInfo.items.length) * idx && itemProgress < (100 / stepInfo.items.length) * (idx + 1);

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-sky-50 border-2 border-sky-200' :
                                            isCompleted ? 'bg-emerald-50 border border-emerald-100' :
                                                'bg-slate-50 border border-slate-100'
                                        }`}
                                    style={{
                                        animationDelay: `${idx * 100}ms`,
                                    }}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-emerald-500' :
                                            isActive ? 'bg-sky-500 animate-pulse' :
                                                'bg-slate-200'
                                        }`}>
                                        {isCompleted ? (
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : isActive ? (
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                        ) : (
                                            <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${isActive ? 'text-sky-900' :
                                            isCompleted ? 'text-emerald-900' :
                                                'text-slate-500'
                                        }`}>
                                        {item}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Message */}
                {isAnalysisStep && (
                    <div className="px-8 pb-6">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-xs text-amber-800 text-center">
                                <span className="font-bold">💡 Pro Tip:</span> We're generating comprehensive manufacturing intelligence specifically for your product. This deep analysis is worth the wait!
                            </p>
                        </div>
                    </div>
                )}

                {/* Completion Message */}
                {currentStep === 'complete' && (
                    <div className="px-8 pb-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-600 text-sm">Your project is ready with comprehensive manufacturing intelligence!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
