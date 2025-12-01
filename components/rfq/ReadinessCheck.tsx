'use client';

import React from 'react';
import { Check, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReadinessCheckProps {
    project: any;
}

export default function ReadinessCheck({ project }: ReadinessCheckProps) {
    const checks = [
        {
            label: 'Product specifications confirmed',
            isComplete: !!project.specs_confirmed_at,
            link: `/projects/${project.id}/details`
        },
        {
            label: 'Cost targets set',
            isComplete: !!project.commercials?.target_unit_cost,
            link: `/projects/${project.id}/costs`
        },
        {
            label: 'Technical specs defined',
            isComplete: (project.specs?.materials?.length > 0 || !!project.specs?.dimensions),
            link: `/projects/${project.id}/details`
        }
    ];

    const allComplete = checks.every(c => c.isComplete);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${allComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {allComplete ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {allComplete ? 'Ready to Send' : 'Readiness Check'}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">
                        {allComplete
                            ? 'Your project data is complete. You are ready to source suppliers.'
                            : 'Complete these items to get better supplier matches:'}
                    </p>

                    <div className="space-y-2 mb-4">
                        {checks.map((check, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                {check.isComplete ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                                )}
                                <span className={check.isComplete ? 'text-slate-700' : 'text-slate-500'}>
                                    {check.label}
                                </span>
                                {!check.isComplete && (
                                    <Link href={check.link} className="text-xs text-emerald-600 hover:underline ml-auto">
                                        Complete now &rarr;
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {!allComplete && (
                        <div className="flex gap-3">
                            <Link
                                href={`/projects/${project.id}/details`}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2"
                            >
                                Complete Specs <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium">
                                Continue anyway
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
