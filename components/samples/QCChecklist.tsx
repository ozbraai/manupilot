'use client';

import React from 'react';
import { SampleQCItem } from '@/types/samples';

type QCChecklistProps = {
    items: SampleQCItem[];
    loading: boolean;
    onToggleItem: (itemId: string, result: 'pass' | 'fail' | 'not_checked') => void;
    onGenerate: () => void;
};

export default function QCChecklist({ items, loading, onToggleItem, onGenerate }: QCChecklistProps) {

    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <div className="animate-spin text-3xl mb-3">↻</div>
                    <p className="text-slate-500 text-sm">Loading Quality Checks...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-4">
                    📋
                </div>
                <h3 className="font-bold text-slate-900 mb-2">No QC Checklist Yet</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-6">
                    Generate a tailored quality control checklist based on your product category.
                </p>
                <button
                    onClick={onGenerate}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                    ✨ Generate with AI
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <h3 className="text-lg font-bold text-slate-900">Quality Checklist</h3>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {items.filter(i => i.result === 'pass').length}/{items.length} Passed
                </span>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${item.result === 'pass' ? 'bg-emerald-50 border-emerald-100' :
                                item.result === 'fail' ? 'bg-red-50 border-red-100' :
                                    'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox / Status Icon */}
                            <button
                                onClick={() => {
                                    const next = item.result === 'pass' ? 'not_checked' : 'pass';
                                    onToggleItem(item.id, next);
                                }}
                                className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${item.result === 'pass' ? 'bg-emerald-500 border-emerald-500 text-white' :
                                        item.result === 'fail' ? 'bg-white border-red-300 text-red-500' :
                                            'bg-white border-slate-300 text-transparent hover:border-indigo-400'
                                    }`}
                            >
                                {item.result === 'pass' && '✓'}
                                {item.result === 'fail' && '✕'}
                            </button>

                            <div className="flex-1">
                                <p className={`text-sm font-medium ${item.result === 'pass' ? 'text-emerald-900' :
                                        item.result === 'fail' ? 'text-red-900' :
                                            'text-slate-700'
                                    }`}>
                                    {item.criteria}
                                </p>
                            </div>

                            {/* Fail Button (only show if not passed) */}
                            {item.result !== 'pass' && (
                                <button
                                    onClick={() => onToggleItem(item.id, item.result === 'fail' ? 'not_checked' : 'fail')}
                                    className={`text-xs font-bold px-2 py-1 rounded transition-colors ${item.result === 'fail'
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                >
                                    Fail
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
