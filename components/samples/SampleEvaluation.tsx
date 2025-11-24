'use client';

import React, { useState, useEffect } from 'react';
import { Sample, SampleStatus } from '@/types/samples';

type SampleEvaluationProps = {
    sample: Sample;
    onUpdate: (status: SampleStatus, notes: string) => void;
};

export default function SampleEvaluation({ sample, onUpdate }: SampleEvaluationProps) {
    const [notes, setNotes] = useState(sample.notes || '');
    const [decision, setDecision] = useState<SampleStatus | ''>(
        sample.status === 'approved' || sample.status === 'revision_required' ? sample.status : ''
    );
    const [isSaving, setIsSaving] = useState(false);

    // Sync state if sample changes
    useEffect(() => {
        setNotes(sample.notes || '');
        setDecision(
            sample.status === 'approved' || sample.status === 'revision_required' ? sample.status : ''
        );
    }, [sample]);

    async function handleSave() {
        if (!decision) return;
        setIsSaving(true);
        await onUpdate(decision, notes);
        setIsSaving(false);
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">⚖️</span>
                <h3 className="text-lg font-bold text-slate-900">Final Evaluation</h3>
            </div>

            <div className="space-y-6 flex-1">

                {/* Decision Radios */}
                <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${decision === 'approved'
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 hover:border-emerald-200'
                        }`}>
                        <input
                            type="radio"
                            name="decision"
                            value="approved"
                            checked={decision === 'approved'}
                            onChange={() => setDecision('approved')}
                            className="hidden"
                        />
                        <span className="text-2xl">✅</span>
                        <span className={`font-bold text-sm ${decision === 'approved' ? 'text-emerald-700' : 'text-slate-600'}`}>
                            Approve Sample
                        </span>
                    </label>

                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${decision === 'revision_required'
                            ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-white border-slate-200 hover:border-amber-200'
                        }`}>
                        <input
                            type="radio"
                            name="decision"
                            value="revision_required"
                            checked={decision === 'revision_required'}
                            onChange={() => setDecision('revision_required')}
                            className="hidden"
                        />
                        <span className="text-2xl">🚧</span>
                        <span className={`font-bold text-sm ${decision === 'revision_required' ? 'text-amber-700' : 'text-slate-600'}`}>
                            Request Revision
                        </span>
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Evaluation Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Summarize your findings. What was good? What needs fixing?"
                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                </div>

            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={!decision || isSaving}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all ${!decision ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                            decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100' :
                                'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-100'
                        }`}
                >
                    {isSaving ? 'Saving...' : 'Submit Evaluation'}
                </button>
            </div>
        </div>
    );
}
