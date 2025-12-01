'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface RFQPreviewProps {
    rfq: any;
    projectTitle: string;
}

export default function RFQPreview({ rfq, projectTitle }: RFQPreviewProps) {
    const today = new Date().toLocaleDateString();
    const refNumber = `RFQ-${new Date().getFullYear()}-${projectTitle.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Document Preview</h3>
            </div>

            <div className="bg-white border border-slate-300 shadow-sm p-8 max-w-2xl mx-auto font-serif text-slate-900 text-sm leading-relaxed">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wider mb-1">Request for Quotation</h1>
                        <p className="text-slate-500 text-xs uppercase tracking-widest">OEM Manufacturing</p>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-bold text-slate-400">REF:</span> {refNumber}</p>
                        <p><span className="font-bold text-slate-400">DATE:</span> {today}</p>
                        <p><span className="font-bold text-slate-400">STATUS:</span> DRAFT</p>
                    </div>
                </div>

                {/* Project Info */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Project Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs text-slate-500">Project Name</span>
                            <span className="font-bold">{projectTitle}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500">Category</span>
                            <span className="font-bold">{rfq.category || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Commercial Terms */}
                <div className="mb-8 bg-slate-50 p-4 rounded border border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Commercial Terms (Fixed)</h2>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><span className="font-bold">Payment:</span> 30% Deposit / 70% Balance (Before Shipment)</li>
                        <li><span className="font-bold">Incoterms:</span> FOB (Free On Board)</li>
                        <li><span className="font-bold">Quality Control:</span> Third-party inspection (AQL 2.5) required before balance payment.</li>
                    </ul>
                </div>

                {/* Message */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Message to Supplier</h2>
                    <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded border border-slate-100 font-sans text-xs">
                        {rfq.message || 'No message content.'}
                    </div>
                </div>

                {/* Specs Summary */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Technical Specifications</h2>
                    <table className="w-full text-xs border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 font-bold w-1/3">Materials</td>
                                <td className="py-2">{rfq.specs?.materials?.join(', ') || 'N/A'}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 font-bold">Dimensions</td>
                                <td className="py-2">{rfq.specs?.dimensions || 'N/A'}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 font-bold">Weight</td>
                                <td className="py-2">{rfq.specs?.weight || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Required Breakdown */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Required Price Breakdown</h2>
                    <p className="text-xs text-slate-500 mb-2">Please provide a quotation including the following itemized costs:</p>
                    <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-slate-300 rounded-sm" /> Unit Price (EXW)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-slate-300 rounded-sm" /> Packaging Cost
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-slate-300 rounded-sm" /> FOB Charges (Local transport & customs)
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-slate-300 rounded-sm" /> Tooling / NRE (Mold costs)
                        </li>
                    </ul>
                </div>

                {/* Additional Questions */}
                {rfq.questions && rfq.questions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-slate-400 uppercase mb-2">Additional Questions</h2>
                        <ul className="list-decimal list-inside space-y-1 text-xs">
                            {rfq.questions.map((q: string, idx: number) => (
                                <li key={idx}>{q}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="text-center mt-12 pt-6 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Generated via ManuPilot Sourcing Engine</p>
                </div>
            </div>
        </div>
    );
}
