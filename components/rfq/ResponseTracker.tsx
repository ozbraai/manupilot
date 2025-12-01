'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

interface ResponseTrackerProps {
    rfq: any;
    quotes?: any[];
}

export default function ResponseTracker({ rfq, quotes = [] }: ResponseTrackerProps) {
    // Mock suppliers if not present in RFQ (fallback)
    const suppliers = [
        { id: 's1', name: 'Supplier A (Shenzhen)', type: 'Metal fabrication + Assembly', responseTime: '2-3 days' },
        { id: 's2', name: 'Supplier B (Foshan)', type: 'Full production capability', responseTime: '3-4 days' },
        { id: 's3', name: 'Supplier C (Vietnam)', type: 'Assembly + Export experience', responseTime: '2-4 days' }
    ];

    const getStatus = (supplierId: string) => {
        const quote = quotes.find(q => q.supplierId === supplierId);
        if (quote) return { status: 'QUOTED', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
        return { status: 'PENDING', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock };
    };

    return (
        <div className="space-y-6 mb-8">
            {/* Header Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">RFQ Sent Successfully</h3>
                        <p className="text-sm text-slate-500">
                            Sent: {new Date(rfq.sentAt || Date.now()).toLocaleDateString()} at {new Date(rfq.sentAt || Date.now()).toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Reference</p>
                        <p className="font-mono text-sm text-slate-900">{rfq.referenceNumber || 'RFQ-2025-AC1E'}</p>
                    </div>
                </div>
            </div>

            {/* Tracking List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Response Tracking</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
                        {quotes.length} of {suppliers.length} replied
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {suppliers.map((supplier) => {
                        const { status, color, icon: Icon } = getStatus(supplier.id);
                        const quote = quotes.find(q => q.supplierId === supplier.id);

                        return (
                            <div key={supplier.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900">{supplier.name}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${color}`}>
                                            {status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {status === 'QUOTED' && <CheckCircle2 className="w-3 h-3" />}
                                            {status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{supplier.type}</p>
                                </div>

                                <div className="text-right">
                                    {status === 'QUOTED' ? (
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-900">Unit Price: ${quote.unitPrice}</p>
                                            <p className="text-xs text-slate-500">MOQ: {quote.moq} | Lead: {quote.leadTime}</p>
                                            <button className="text-xs text-emerald-600 font-bold hover:underline mt-1">
                                                View Full Quote &rarr;
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-xs text-slate-400 italic">Typical response: {supplier.responseTime}</p>
                                            <button className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> Send Reminder
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start">
                <div className="p-1 bg-indigo-100 rounded text-indigo-600 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900 mb-1">What happens next?</h4>
                    <ul className="text-xs text-indigo-800 space-y-1 list-disc list-inside">
                        <li>Matched suppliers review your RFQ</li>
                        <li>They submit quotes through ManuPilot</li>
                        <li>You'll be notified via email when quotes arrive</li>
                        <li>Compare quotes and select your supplier below</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
