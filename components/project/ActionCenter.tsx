import React from 'react';
import Link from 'next/link';

type Action = {
    label: string;
    href?: string;
    onClick?: () => void;
    completed?: boolean;
    urgent?: boolean;
};

type Blocker = {
    message: string;
    severity: 'warning' | 'error';
};

type ActionCenterProps = {
    primaryAction: Action;
    secondaryActions: Action[];
    blockers?: Blocker[];
};

export default function ActionCenter({
    primaryAction,
    secondaryActions,
    blockers = []
}: ActionCenterProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Primary Action Area */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">Recommended Next Step</h2>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                            {primaryAction.label}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Based on your current phase, this is the most impactful thing you can do right now to move your project forward.
                        </p>
                    </div>

                    {primaryAction.href ? (
                        <Link
                            href={primaryAction.href}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                        >
                            Start Now &rarr;
                        </Link>
                    ) : (
                        <button
                            onClick={primaryAction.onClick}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                        >
                            Start Now &rarr;
                        </button>
                    )}
                </div>

                {/* Secondary Actions & Blockers */}
                <div className="lg:w-1/3 lg:border-l lg:border-slate-100 lg:pl-8">

                    {/* Blockers */}
                    {blockers.length > 0 && (
                        <div className="mb-6 space-y-3">
                            {blockers.map((blocker, idx) => (
                                <div key={idx} className={`p-3 rounded-lg text-sm flex items-start gap-2 ${blocker.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{blocker.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Secondary List */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Also Pending
                        </h4>
                        <ul className="space-y-3">
                            {secondaryActions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-3 group">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${action.completed
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-slate-300 group-hover:border-slate-400'
                                        }`}>
                                        {action.completed && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    {action.href ? (
                                        <Link href={action.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                                            {action.label}
                                        </Link>
                                    ) : (
                                        <button onClick={action.onClick} className="text-sm text-slate-600 hover:text-slate-900 text-left transition-colors">
                                            {action.label}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
