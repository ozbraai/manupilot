// components/project/ComponentBreakdown.tsx
'use client';

import React from 'react';
import type { ComponentAnalysis } from '@/types/project';

type ComponentBreakdownProps = {
    components: ComponentAnalysis[];
};

export default function ComponentBreakdown({ components }: ComponentBreakdownProps) {
    if (!components || components.length === 0) {
        return null;
    }

    const getComplexityColor = (level: string) => {
        switch (level) {
            case 'low': return 'bg-emerald-100 text-emerald-700';
            case 'medium': return 'bg-amber-100 text-amber-700';
            case 'high': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                🧩 Component Breakdown
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Component</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Material/Spec</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Supplier Type</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Complexity</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Lead Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((component, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0">
                                <td className="py-3 pr-4">
                                    <div className="font-medium text-slate-900">{component.name}</div>
                                    {component.notes && (
                                        <div className="text-xs text-slate-500 mt-1">{component.notes}</div>
                                    )}
                                </td>
                                <td className="py-3 pr-4 text-sm text-slate-700">{component.material_specification}</td>
                                <td className="py-3 pr-4 text-sm text-slate-600">{component.supplier_type}</td>
                                <td className="py-3 pr-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(component.complexity_level)}`}>
                                        {component.complexity_level}
                                    </span>
                                </td>
                                <td className="py-3 text-sm text-slate-700">{component.lead_time_estimate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
