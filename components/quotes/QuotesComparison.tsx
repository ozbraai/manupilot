'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Quote = {
    id: string;
    unit_price: number;
    currency: string;
    total_price: number;
    lead_time_days: number;
    moq: number;
    production_capacity: number | null;
    payment_terms: string | null;
    shipping_terms: string | null;
    notes: string | null;
    status: string;
    created_at: string;
    partner: {
        id: string;
        name: string;
        region: string;
        rating: number | null;
        image_url: string | null;
    };
};

type QuotesComparisonProps = {
    quotes: Quote[];
    rfqId: string;
    onQuoteAccepted?: () => void;
};

export default function QuotesComparison({ quotes, rfqId, onQuoteAccepted }: QuotesComparisonProps) {
    const [accepting, setAccepting] = useState<string | null>(null);

    if (quotes.length === 0) {
        return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
                <p className="text-lg text-zinc-500 mb-2">No quotes received yet</p>
                <p className="text-sm text-zinc-400">Partners will submit their quotes here</p>
            </div>
        );
    }

    // Find best values for highlighting
    const lowestPrice = Math.min(...quotes.map(q => q.unit_price));
    const shortestLeadTime = Math.min(...quotes.map(q => q.lead_time_days));
    const lowestMOQ = Math.min(...quotes.map(q => q.moq));

    async function handleAccept(quoteId: string) {
        if (!confirm('Accept this quote? This will notify the supplier.')) return;

        setAccepting(quoteId);
        try {
            const res = await fetch(`/api/quotes/${quoteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'accepted' }),
            });

            if (res.ok) {
                alert('Quote accepted! The supplier has been notified.');
                onQuoteAccepted?.();
            } else {
                const { error } = await res.json();
                alert(`Error: ${error}`);
            }
        } catch (error) {
            console.error('Error accepting quote:', error);
            alert('Failed to accept quote');
        } finally {
            setAccepting(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Total Quotes</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{quotes.length}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Best Price</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">${lowestPrice.toFixed(2)}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Fastest Lead Time</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{shortestLeadTime} days</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Lowest MOQ</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{lowestMOQ}</p>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">Supplier</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">Unit Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">MOQ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">Lead Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">Total Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-700 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="hover:bg-zinc-50 transition-colors">
                                    {/* Supplier */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {quote.partner.image_url ? (
                                                <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                                                    <img src={quote.partner.image_url} alt={quote.partner.name} className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                                                    🏭
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-zinc-900">{quote.partner.name}</p>
                                                <p className="text-xs text-zinc-500">{quote.partner.region}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Unit Price */}
                                    <td className="px-6 py-4">
                                        <div className={`font-semibold ${quote.unit_price === lowestPrice ? 'text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block' : 'text-zinc-900'}`}>
                                            {quote.currency} ${quote.unit_price.toFixed(2)}
                                            {quote.unit_price === lowestPrice && (
                                                <span className="ml-2 text-xs">🏆 Best</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* MOQ */}
                                    <td className="px-6 py-4">
                                        <span className={`${quote.moq === lowestMOQ ? 'text-purple-600 font-semibold' : 'text-zinc-700'}`}>
                                            {quote.moq.toLocaleString()}
                                        </span>
                                    </td>

                                    {/* Lead Time */}
                                    <td className="px-6 py-4">
                                        <span className={`${quote.lead_time_days === shortestLeadTime ? 'text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg inline-block' : 'text-zinc-700'}`}>
                                            {quote.lead_time_days} days
                                            {quote.lead_time_days === shortestLeadTime && (
                                                <span className="ml-2 text-xs">⚡ Fastest</span>
                                            )}
                                        </span>
                                    </td>

                                    {/* Total Price */}
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-zinc-900">
                                            {quote.currency} ${quote.total_price?.toFixed(2) || 'N/A'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {quote.status === 'accepted' ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                ✓ Accepted
                                            </span>
                                        ) : quote.status === 'rejected' ? (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                                                ✗ Rejected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                                                ⏳ Pending
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {quote.status === 'pending' && (
                                                <button
                                                    onClick={() => handleAccept(quote.id)}
                                                    disabled={accepting === quote.id}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-zinc-300 text-sm font-medium transition-colors"
                                                >
                                                    {accepting === quote.id ? 'Accepting...' : 'Accept'}
                                                </button>
                                            )}
                                            <Link
                                                href={`/manufacturers/${quote.partner.id}`}
                                                className="px-4 py-2 bg-white border-2 border-zinc-200 text-zinc-700 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 text-sm font-medium transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Cards View (for details) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {quotes.map((quote) => (
                    <div key={quote.id} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {quote.partner.image_url ? (
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden">
                                        <img src={quote.partner.image_url} alt={quote.partner.name} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                                        🏭
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-zinc-900">{quote.partner.name}</h3>
                                    <p className="text-sm text-zinc-500">{quote.partner.region}</p>
                                </div>
                            </div>
                            {quote.partner.rating && (
                                <div className="flex items-center gap-1">
                                    <span className="text-amber-400">★</span>
                                    <span className="text-sm font-medium">{quote.partner.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Unit Price:</span>
                                <span className="font-semibold text-zinc-900">{quote.currency} ${quote.unit_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Total Price:</span>
                                <span className="font-semibold text-zinc-900">{quote.currency} ${quote.total_price?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">MOQ:</span>
                                <span className="font-semibold text-zinc-900">{quote.moq.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Lead Time:</span>
                                <span className="font-semibold text-zinc-900">{quote.lead_time_days} days</span>
                            </div>
                            {quote.production_capacity && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-600">Capacity:</span>
                                    <span className="font-semibold text-zinc-900">{quote.production_capacity.toLocaleString()}/month</span>
                                </div>
                            )}
                            {quote.payment_terms && (
                                <div className="text-sm">
                                    <span className="text-zinc-600">Payment:</span>
                                    <p className="text-zinc-900 mt-1">{quote.payment_terms}</p>
                                </div>
                            )}
                            {quote.shipping_terms && (
                                <div className="text-sm">
                                    <span className="text-zinc-600">Shipping:</span>
                                    <p className="text-zinc-900 mt-1">{quote.shipping_terms}</p>
                                </div>
                            )}
                        </div>

                        {quote.notes && (
                            <div className="bg-zinc-50 rounded-lg p-3 mb-4">
                                <p className="text-xs font-medium text-zinc-500 mb-1">Notes:</p>
                                <p className="text-sm text-zinc-700">{quote.notes}</p>
                            </div>
                        )}

                        <p className="text-xs text-zinc-400 mb-3">
                            Submitted {new Date(quote.created_at).toLocaleDateString()}
                        </p>

                        {quote.status === 'pending' && (
                            <button
                                onClick={() => handleAccept(quote.id)}
                                disabled={accepting === quote.id}
                                className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-zinc-300 font-medium transition-colors"
                            >
                                {accepting === quote.id ? 'Accepting...' : '✓ Accept Quote'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
