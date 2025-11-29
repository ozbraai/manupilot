import React from 'react';
import { Sparkles, TrendingDown, AlertTriangle, ThumbsUp } from 'lucide-react';

interface QuoteResponse {
    id: string;
    manufacturer: {
        name: string;
    };
    extracted_metrics: {
        unit_price?: number;
        moq?: number;
        lead_time_days?: number;
    };
    ai_analysis: {
        score: number;
        flags: string[];
        summary: string;
    };
}

interface AIInsightsPanelProps {
    responses: QuoteResponse[];
}

export default function AIInsightsPanel({ responses }: AIInsightsPanelProps) {
    if (responses.length === 0) return null;

    // Find best quote
    const sortedByScore = [...responses].sort((a, b) => b.ai_analysis.score - a.ai_analysis.score);
    const bestQuote = sortedByScore[0];

    // Find lowest price
    const sortedByPrice = [...responses]
        .filter(r => r.extracted_metrics.unit_price)
        .sort((a, b) => (a.extracted_metrics.unit_price || 0) - (b.extracted_metrics.unit_price || 0));
    const cheapestQuote = sortedByPrice[0];

    // Collect all flags
    const allFlags = responses.flatMap(r => r.ai_analysis.flags.map(f => ({ flag: f, manufacturer: r.manufacturer.name })));

    return (
        <div className="bg-white rounded-lg border border-purple-100 shadow-sm p-5 space-y-6">
            <div className="flex items-center gap-2 text-purple-700 font-semibold border-b border-purple-100 pb-3">
                <Sparkles size={18} />
                <h2>AI Negotiation Insights</h2>
            </div>

            {/* Top Recommendation */}
            {bestQuote && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Recommendation</h3>
                    <div className="bg-purple-50 rounded-md p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            <ThumbsUp size={16} className="text-purple-600" />
                            <span className="font-bold text-gray-900">{bestQuote.manufacturer.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Highest score ({bestQuote.ai_analysis.score}/100). {bestQuote.ai_analysis.summary}
                        </p>
                    </div>
                </div>
            )}

            {/* Price Opportunity */}
            {cheapestQuote && cheapestQuote.id !== bestQuote?.id && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Opportunity</h3>
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-md border border-emerald-100">
                        <TrendingDown size={18} className="text-emerald-600 mt-0.5" />
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900">{cheapestQuote.manufacturer.name}</span> offers a lower price
                            {bestQuote.extracted_metrics.unit_price && cheapestQuote.extracted_metrics.unit_price && (
                                <span className="font-bold text-emerald-700 ml-1">
                                    ({Math.round(((bestQuote.extracted_metrics.unit_price - cheapestQuote.extracted_metrics.unit_price) / bestQuote.extracted_metrics.unit_price) * 100)}% cheaper)
                                </span>
                            )}
                            , but has a lower overall score. Consider negotiating price with {bestQuote.manufacturer.name} using this as leverage.
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Radar */}
            {allFlags.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Radar</h3>
                    <ul className="space-y-2">
                        {allFlags.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                <span>
                                    <span className="font-medium text-gray-900">{item.manufacturer}:</span> {item.flag}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
