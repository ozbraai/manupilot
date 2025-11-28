// components/project/FounderCoaching.tsx
'use client';

import React, { useState } from 'react';
import type { CoachingItem } from '@/types/project';

type FounderCoachingProps = {
    coachingItems: CoachingItem[];
};

export default function FounderCoaching({ coachingItems }: FounderCoachingProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    if (!coachingItems || coachingItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                💬 Founder Coaching
            </h3>

            <div className="space-y-3">
                {coachingItems.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <span className="font-medium text-slate-900 text-left">{item.topic}</span>
                            <span className="text-slate-400 text-xl">{expandedIndex === idx ? '−' : '+'}</span>
                        </button>

                        {expandedIndex === idx && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                                <div className="mb-4">
                                    <p className="text-sm text-slate-700 leading-relaxed">{item.guidance}</p>
                                </div>

                                {item.common_mistakes && item.common_mistakes.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-red-600 uppercase mb-2">❌ Common Mistakes</p>
                                        <ul className="space-y-1">
                                            {item.common_mistakes.map((mistake, mIdx) => (
                                                <li key={mIdx} className="text-sm text-red-700 flex items-start gap-2">
                                                    <span>•</span>
                                                    <span>{mistake}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {item.best_practices && item.best_practices.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2">✓ Best Practices</p>
                                        <ul className="space-y-1">
                                            {item.best_practices.map((practice, pIdx) => (
                                                <li key={pIdx} className="text-sm text-emerald-700 flex items-start gap-2">
                                                    <span>•</span>
                                                    <span>{practice}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
