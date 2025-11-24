'use client';

import React from 'react';
import { Sample, SampleStatus } from '@/types/samples';

type SampleStatusTrackerProps = {
    samples: Sample[];
    selectedSampleId: string | null;
    onSelectSample: (id: string) => void;
    onCreateSample: () => void;
    onUpdateStatus: (status: SampleStatus) => void;
};

const STEPS: { id: SampleStatus; label: string; icon: string }[] = [
    { id: 'requested', label: 'Requested', icon: '📝' },
    { id: 'in_production', label: 'In Production', icon: '🏭' },
    { id: 'shipped', label: 'Shipped', icon: '🚚' },
    { id: 'received', label: 'Received', icon: '📦' },
    { id: 'approved', label: 'Evaluated', icon: '✅' }, // Covers approved & revision_required
];

export default function SampleStatusTracker({
    samples,
    selectedSampleId,
    onSelectSample,
    onCreateSample,
    onUpdateStatus
}: SampleStatusTrackerProps) {

    const selectedSample = samples.find(s => s.id === selectedSampleId);
    const currentStepIndex = selectedSample
        ? STEPS.findIndex(step => step.id === selectedSample.status || (step.id === 'approved' && selectedSample.status === 'revision_required'))
        : -1;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🧪</span>
                    <h3 className="text-lg font-bold text-slate-900">Sample Status</h3>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedSampleId || ''}
                        onChange={(e) => onSelectSample(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                    >
                        {samples.length === 0 && <option value="">No samples yet</option>}
                        {samples.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.sample_number} - {new Date(s.created_at).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={onCreateSample}
                        className="text-sm bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                        + New Sample
                    </button>
                </div>
            </div>

            {selectedSample ? (
                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full -z-10" />

                    {/* Progress Bar Fill */}
                    <div
                        className="absolute top-5 left-0 h-1 bg-indigo-500 rounded-full -z-10 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />

                    <div className="flex justify-between">
                        {STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center gap-2 cursor-pointer group ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}
                                    onClick={() => {
                                        // Allow moving forward/backward manually for now
                                        if (selectedSample) onUpdateStatus(step.id);
                                    }}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all bg-white ${isCompleted ? 'border-indigo-500 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-300'
                                        } ${isCurrent ? 'ring-4 ring-indigo-50 scale-110' : ''}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-700' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Context Info */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-500">
                        <div>
                            <span className="font-bold uppercase tracking-wider block mb-0.5">Requested</span>
                            {new Date(selectedSample.requested_at).toLocaleDateString()}
                        </div>
                        {selectedSample.received_at && (
                            <div>
                                <span className="font-bold uppercase tracking-wider block mb-0.5">Received</span>
                                {new Date(selectedSample.received_at).toLocaleDateString()}
                            </div>
                        )}
                        {selectedSample.status === 'revision_required' && (
                            <div className="text-amber-600">
                                <span className="font-bold uppercase tracking-wider block mb-0.5">Status</span>
                                Revision Required
                            </div>
                        )}
                        {selectedSample.status === 'approved' && (
                            <div className="text-emerald-600">
                                <span className="font-bold uppercase tracking-wider block mb-0.5">Status</span>
                                Approved
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 mb-4">No sample selected.</p>
                    <button onClick={onCreateSample} className="text-indigo-600 font-bold hover:underline">
                        Create your first sample record
                    </button>
                </div>
            )}
        </div>
    );
}
