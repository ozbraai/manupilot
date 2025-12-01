'use client';

import React, { useState } from 'react';

type ReferenceSection = {
    id: string;
    title: string;
    summary: string;
    content: React.ReactNode;
    icon?: string;
};

type ReferenceAccordionProps = {
    sections: ReferenceSection[];
    defaultExpanded?: string;
};

export default function ReferenceAccordion({
    sections,
    defaultExpanded
}: ReferenceAccordionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(defaultExpanded || null);

    const toggleSection = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4 mb-24">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
                Project Reference
            </h3>

            {sections.map((section) => {
                const isExpanded = expandedId === section.id;

                return (
                    <div
                        key={section.id}
                        className={`bg-white border rounded-xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-slate-300 shadow-md ring-1 ring-slate-200' : 'border-slate-200 shadow-sm hover:border-slate-300'
                            }`}
                    >
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl opacity-70">{section.icon || '📄'}</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
                                    {!isExpanded && (
                                        <p className="text-xs text-slate-500 mt-0.5">{section.summary}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="p-4 pt-0 border-t border-slate-100">
                                <div className="pt-4">
                                    {section.content}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
