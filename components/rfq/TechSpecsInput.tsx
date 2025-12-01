import React from 'react';
import { Wand2, Edit2 } from 'lucide-react';

interface TechSpecsInputProps {
    specs: any;
    onUpdate: (specs: any) => void;
}

export default function TechSpecsInput({ specs, onUpdate }: TechSpecsInputProps) {
    const hasSpecs = specs && (specs.materials?.length > 0 || specs.dimensions || specs.weight);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">1</div>
                    <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
                </div>
                {!hasSpecs && (
                    <button className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                        <Wand2 className="w-4 h-4" />
                        Auto-Fill with AI
                    </button>
                )}
            </div>

            {hasSpecs ? (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Materials</span>
                            <p className="text-sm text-slate-900 mt-1">{specs.materials?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Dimensions</span>
                            <p className="text-sm text-slate-900 mt-1">{specs.dimensions || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Weight</span>
                            <p className="text-sm text-slate-900 mt-1">{specs.weight || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Features</span>
                            <p className="text-sm text-slate-900 mt-1">{specs.features?.join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">
                            <Edit2 className="w-3 h-3" /> Edit Specs
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500 mb-2">No technical specifications defined yet.</p>
                    <button className="text-emerald-600 font-medium hover:underline">
                        Generate using AI Co-Pilot
                    </button>
                </div>
            )}
        </div>
    );
}
