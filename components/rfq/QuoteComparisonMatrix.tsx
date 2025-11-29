import React from 'react';
import { ArrowDown, ArrowUp, Check, AlertTriangle, Minus } from 'lucide-react';

interface QuoteResponse {
    id: string;
    manufacturer: {
        id: string;
        name: string;
        logo_url?: string;
    };
    extracted_metrics: {
        unit_price?: number;
        moq?: number;
        lead_time_days?: number;
        payment_terms?: string;
        currency?: string;
    };
    ai_analysis: {
        score: number;
        flags: string[];
        summary: string;
    };
}

interface QuoteComparisonMatrixProps {
    responses: QuoteResponse[];
    targetPrice?: number;
    targetMoq?: number;
}

export default function QuoteComparisonMatrix({ responses, targetPrice, targetMoq }: QuoteComparisonMatrixProps) {
    if (responses.length === 0) {
        return <div className="p-8 text-center text-gray-500">No quotes to compare yet.</div>;
    }

    // Helper to format currency
    const formatCurrency = (amount?: number, currency = 'USD') => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    // Find best values for highlighting
    const minPrice = Math.min(...responses.map(r => r.extracted_metrics.unit_price || Infinity));
    const minMoq = Math.min(...responses.map(r => r.extracted_metrics.moq || Infinity));
    const minLeadTime = Math.min(...responses.map(r => r.extracted_metrics.lead_time_days || Infinity));
    const maxScore = Math.max(...responses.map(r => r.ai_analysis.score || 0));

    return (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 font-medium text-gray-900">Metric</th>
                        {responses.map(response => (
                            <th key={response.id} className="px-6 py-4 font-bold text-gray-900 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                    {response.manufacturer.logo_url && (
                                        <img src={response.manufacturer.logo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    )}
                                    <span>{response.manufacturer.name}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {/* AI Score Row */}
                    <tr className="bg-blue-50/30">
                        <td className="px-6 py-4 font-medium text-blue-800">AI Score</td>
                        {responses.map(response => (
                            <td key={response.id} className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${response.ai_analysis.score >= 80 ? 'bg-emerald-500' :
                                                response.ai_analysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${response.ai_analysis.score}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-900">{response.ai_analysis.score}</span>
                                    {response.ai_analysis.score === maxScore && (
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">Best</span>
                                    )}
                                </div>
                            </td>
                        ))}
                    </tr>

                    {/* Unit Price */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">
                            Unit Price
                            {targetPrice && <div className="text-xs text-gray-500 font-normal mt-0.5">Target: {formatCurrency(targetPrice)}</div>}
                        </td>
                        {responses.map(response => {
                            const price = response.extracted_metrics.unit_price;
                            const isBest = price === minPrice && price !== undefined;
                            const isOverTarget = targetPrice && price && price > targetPrice;

                            return (
                                <td key={response.id} className={`px-6 py-4 ${isBest ? 'bg-emerald-50/50' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${isBest ? 'text-emerald-700' : 'text-gray-900'}`}>
                                            {formatCurrency(price, response.extracted_metrics.currency)}
                                        </span>
                                        {isBest && <Check size={14} className="text-emerald-600" />}
                                        {isOverTarget && (
                                            <span title="Above Target">
                                                <ArrowUp size={14} className="text-red-500" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    {/* MOQ */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">
                            MOQ
                            {targetMoq && <div className="text-xs text-gray-500 font-normal mt-0.5">Target: {targetMoq}</div>}
                        </td>
                        {responses.map(response => {
                            const moq = response.extracted_metrics.moq;
                            const isBest = moq === minMoq && moq !== undefined;

                            return (
                                <td key={response.id} className={`px-6 py-4 ${isBest ? 'bg-emerald-50/50' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={isBest ? 'text-emerald-700 font-medium' : 'text-gray-700'}>
                                            {moq?.toLocaleString() || '-'}
                                        </span>
                                        {isBest && <Check size={14} className="text-emerald-600" />}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Lead Time */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Lead Time</td>
                        {responses.map(response => {
                            const days = response.extracted_metrics.lead_time_days;
                            const isBest = days === minLeadTime && days !== undefined;

                            return (
                                <td key={response.id} className={`px-6 py-4 ${isBest ? 'bg-emerald-50/50' : ''}`}>
                                    <span className={isBest ? 'text-emerald-700 font-medium' : 'text-gray-700'}>
                                        {days ? `${days} days` : '-'}
                                    </span>
                                </td>
                            );
                        })}
                    </tr>

                    {/* Payment Terms */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Payment Terms</td>
                        {responses.map(response => (
                            <td key={response.id} className="px-6 py-4 text-gray-700">
                                {response.extracted_metrics.payment_terms || '-'}
                            </td>
                        ))}
                    </tr>

                    {/* Flags / Issues */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Potential Issues</td>
                        {responses.map(response => (
                            <td key={response.id} className="px-6 py-4 align-top">
                                {response.ai_analysis.flags && response.ai_analysis.flags.length > 0 ? (
                                    <ul className="space-y-1">
                                        {response.ai_analysis.flags.map((flag, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                                <span>{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded w-fit">
                                        <Check size={12} />
                                        <span>No issues flagged</span>
                                    </div>
                                )}
                            </td>
                        ))}
                    </tr>

                    {/* Summary */}
                    <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">AI Summary</td>
                        {responses.map(response => (
                            <td key={response.id} className="px-6 py-4 text-xs text-gray-600 leading-relaxed min-w-[200px]">
                                {response.ai_analysis.summary || '-'}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
