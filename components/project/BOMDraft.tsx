// components/project/BOMDraft.tsx
'use client';

import React, { useState } from 'react';
import type { BOMItem } from '@/types/project';

type BOMDraftProps = {
    bomItems: BOMItem[];
};

export default function BOMDraft({ bomItems }: BOMDraftProps) {
    const [expanded, setExpanded] = useState(false);

    if (!bomItems || bomItems.length === 0) {
        return null;
    }

    const displayItems = expanded ? bomItems : bomItems.slice(0, 5);
    const hasMore = bomItems.length > 5;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    📋 Bill of Materials (Draft)
                </h3>
                <span className="text-xs text-slate-500">{bomItems.length} items</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3 pr-4">Part #</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3 pr-4">Description</th>
                            <th className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider pb-3 px-4">Qty</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3 px-4">Est. Cost</th>
                            <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider pb-3">Supplier Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0">
                                <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{item.part_number || '-'}</td>
                                <td className="py-3 pr-4">
                                    <div className="text-slate-900">{item.description}</div>
                                    {item.notes && (
                                        <div className="text-xs text-slate-500 mt-1">{item.notes}</div>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center font-medium text-slate-900">{item.quantity}</td>
                                <td className="py-3 px-4 text-slate-700">{item.unit_cost_estimate || 'TBD'}</td>
                                <td className="py-3 text-slate-600">{item.supplier_type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 w-full py-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                    {expanded ? '↑ Show Less' : `↓ Show All ${bomItems.length} Items`}
                </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                    This is a preliminary BOM. Refine with your supplier during negotiations.
                </p>
            </div>
        </div>
    );
}
