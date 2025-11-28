// components/project/CertificationMap.tsx
'use client';

import React from 'react';
import type { CertificationRequirement } from '@/types/project';

type CertificationMapProps = {
    certifications: CertificationRequirement[];
};

export default function CertificationMap({ certifications }: CertificationMapProps) {
    if (!certifications || certifications.length === 0) {
        return null;
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'recommended': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'optional': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                🏅 Certification & Compliance Map
            </h3>

            <div className="space-y-4">
                {certifications.map((cert, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-bold text-slate-900">{cert.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(cert.priority)}`}>
                                        {cert.priority}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {cert.required_for_markets.join(', ')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-slate-900">{cert.approximate_cost}</div>
                                <div className="text-xs text-slate-500">{cert.timeline_to_obtain}</div>
                            </div>
                        </div>

                        {cert.testing_requirements && cert.testing_requirements.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs font-medium text-slate-600 mb-2">Testing Requirements:</p>
                                <ul className="space-y-1">
                                    {cert.testing_requirements.map((req, reqIdx) => (
                                        <li key={reqIdx} className="text-xs text-slate-600 flex items-start gap-2">
                                            <span className="text-slate-400">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
