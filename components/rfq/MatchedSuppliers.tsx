'use client';

import React from 'react';
import { Users, MapPin, CheckCircle2 } from 'lucide-react';

interface MatchedSuppliersProps {
    project: any;
}

export default function MatchedSuppliers({ project }: MatchedSuppliersProps) {
    // Mock data - in real app this would come from the matching API
    const matchCriteria = {
        category: project.category || 'General',
        capabilities: ['Metal fabrication', 'Textile', 'Assembly'],
        region: 'Shenzhen, China (primary), Vietnam (alt)',
        moqRange: '300-1000 units'
    };

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Supplier Matching</h3>
                        <p className="text-xs text-slate-500">3 verified suppliers found</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
                Based on your product requirements, we'll match you with verified suppliers in our network.
            </p>

            <div className="bg-white rounded-lg p-4 border border-indigo-100 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your RFQ will be sent to suppliers matching:</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span className="text-slate-700"><span className="font-semibold">Category:</span> {matchCriteria.category}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span className="text-slate-700"><span className="font-semibold">Capabilities:</span> {matchCriteria.capabilities.join(', ')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span className="text-slate-700"><span className="font-semibold">Region:</span> {matchCriteria.region}</span>
                    </li>
                </ul>
            </div>

            <div className="text-center">
                <p className="text-xs text-slate-500 mb-4">Estimated response time: 2-5 business days</p>
                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2">
                    Send RFQ Package (Auto-match)
                </button>
            </div>
        </div>
    );
}
