'use client';

import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface QuoteComparisonProps {
    quotes: any[];
    project: any;
}

export default function QuoteComparison({ quotes, project }: QuoteComparisonProps) {
    const targetPrice = project.commercials?.target_unit_cost || 15.00;
    const targetMoq = 500;

    // Mock quotes if empty for visualization
    const displayQuotes = quotes.length > 0 ? quotes : [
        {
            id: 'q1',
            supplierName: 'Supplier A',
            unitPrice: 14.20,
            moq: 1000,
            leadTime: '4 weeks',
            paymentTerms: '30/70',
            tooling: 0,
            certifications: ['EN 581'],
            packaging: 'Included'
        },
        {
            id: 'q2',
            supplierName: 'Supplier B',
            unitPrice: 15.80,
            moq: 500,
            leadTime: '6 weeks',
            paymentTerms: '50/50',
            tooling: 500,
            certifications: [],
            packaging: '+$0.50/unit'
        }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900">Quote Comparison</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-4 font-medium text-slate-500 w-1/4">Feature</th>
                            {displayQuotes.map(q => (
                                <th key={q.id} className="p-4 font-bold text-slate-900 w-1/4">{q.supplierName}</th>
                            ))}
                            <th className="p-4 font-medium text-slate-500 w-1/4 bg-slate-50">Your Target</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="p-4 font-medium text-slate-700">Unit Price (EXW)</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className={q.unitPrice <= targetPrice ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                                            ${q.unitPrice.toFixed(2)}
                                        </span>
                                        {q.unitPrice <= targetPrice && <Check className="w-3 h-3 text-emerald-500" />}
                                    </div>
                                </td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">${targetPrice.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-700">MOQ</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className={q.moq <= targetMoq ? 'text-emerald-600 font-bold' : 'text-slate-900'}>
                                            {q.moq.toLocaleString()}
                                        </span>
                                        {q.moq <= targetMoq && <Check className="w-3 h-3 text-emerald-500" />}
                                    </div>
                                </td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">{targetMoq}</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-700">Lead Time</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">{q.leadTime}</td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">—</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-700">Payment Terms</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">{q.paymentTerms}</td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">—</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-700">Tooling / NRE</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">${q.tooling}</td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">—</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-700">Certifications</td>
                            {displayQuotes.map(q => (
                                <td key={q.id} className="p-4">
                                    {q.certifications.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {q.certifications.map((c: string) => (
                                                <span key={c} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-100">{c}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">None</span>
                                    )}
                                </td>
                            ))}
                            <td className="p-4 text-slate-500 bg-slate-50">Required</td>
                        </tr>
                        <tr className="bg-slate-50/30">
                            <td className="p-4 font-bold text-slate-900">Total (500 units)</td>
                            {displayQuotes.map(q => {
                                const total = (q.unitPrice * 500) + q.tooling;
                                const isMoqIssue = q.moq > 500;
                                return (
                                    <td key={q.id} className="p-4">
                                        <div className="font-bold text-slate-900">${total.toLocaleString()}</div>
                                        {isMoqIssue && <div className="text-[10px] text-amber-600 font-medium">*MOQ {q.moq}</div>}
                                    </td>
                                );
                            })}
                            <td className="p-4 text-slate-500 bg-slate-50">—</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-amber-50 border-t border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Recommendation
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs text-amber-900">
                    <p>
                        <strong>Supplier A</strong> offers better unit price and has required certifications, but requires 1,000 unit MOQ.
                    </p>
                    <p>
                        <strong>Supplier B</strong> meets your 500 unit target but lacks EN 581 certification needed for EU market.
                    </p>
                </div>
            </div>
        </div>
    );
}
