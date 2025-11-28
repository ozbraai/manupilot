'use client';

import React from 'react';

interface PlaybookStickyBarProps {
    onCreateProject: () => void;
    creatingProject: boolean;
    creationProgress?: string;
}

export default function PlaybookStickyBar({ onCreateProject, creatingProject, creationProgress }: PlaybookStickyBarProps) {
    return (
        <div className="sticky top-16 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Playbook Preview</span>
                    <p className="text-sm font-medium text-slate-900 hidden md:block">
                        High-level feasibility snapshot. Create a project to unlock the full plan.
                    </p>
                </div>

                <button
                    onClick={onCreateProject}
                    disabled={creatingProject}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[200px] justify-center"
                >
                    {creatingProject ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs">{creationProgress || 'Creating...'}</span>
                        </>
                    ) : (
                        <>
                            <span>Unlock Full Intelligence</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
