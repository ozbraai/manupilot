'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SupplierSelectorProps {
    quotes: any[];
    onSelect: (supplierId: string) => void;
}

export default function SupplierSelector({ quotes, onSelect }: SupplierSelectorProps) {
    // Mock quotes if empty
    const displayQuotes = quotes.length > 0 ? quotes : [
        { id: 'q1', supplierName: 'Supplier A', supplierId: 's1' },
        { id: 'q2', supplierName: 'Supplier B', supplierId: 's2' }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Select Supplier</h3>
            <p className="text-sm text-slate-500 mb-6">
                Selecting a supplier will move you to the Sampling phase, allow you to request product samples, and lock in preliminary terms.
            </p>

            <div className="flex flex-wrap gap-4">
                {displayQuotes.map(q => (
                    <button
                        key={q.id}
                        onClick={() => onSelect(q.supplierId)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm hover:shadow"
                    >
                        Select {q.supplierName} <ArrowRight className="w-4 h-4" />
                    </button>
                ))}
                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Wait for more quotes
                </button>
            </div>
        </div>
    );
}
