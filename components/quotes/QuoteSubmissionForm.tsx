'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type QuoteSubmissionFormProps = {
    rfqId: string;
    partnerId: string;
    onQuoteSubmitted?: () => void;
};

export default function QuoteSubmissionForm({ rfqId, partnerId, onQuoteSubmitted }: QuoteSubmissionFormProps) {
    const [user, setUser] = useState<any>(null);
    const [existingQuote, setExistingQuote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [unitPrice, setUnitPrice] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [leadTimeDays, setLeadTimeDays] = useState('');
    const [moq, setMoq] = useState('');
    const [productionCapacity, setProductionCapacity] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [shippingTerms, setShippingTerms] = useState('');
    const [notes, setNotes] = useState('');
    const [validityDays, setValidityDays] = useState('30');

    useEffect(() => {
        async function loadUserAndQuote() {
            setLoading(true);
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    // Check for existing quote
                    const res = await fetch(`/api/quotes?rfqId=${rfqId}`);
                    if (res.ok) {
                        const { quotes } = await res.json();
                        const myQuote = quotes?.find((q: any) => q.partner_id === partnerId);

                        if (myQuote) {
                            setExistingQuote(myQuote);
                            // Pre-fill form
                            setUnitPrice(myQuote.unit_price?.toString() || '');
                            setCurrency(myQuote.currency || 'USD');
                            setLeadTimeDays(myQuote.lead_time_days?.toString() || '');
                            setMoq(myQuote.moq?.toString() || '');
                            setProductionCapacity(myQuote.production_capacity?.toString() || '');
                            setPaymentTerms(myQuote.payment_terms || '');
                            setShippingTerms(myQuote.shipping_terms || '');
                            setNotes(myQuote.notes || '');
                            setValidityDays(myQuote.validity_days?.toString() || '30');
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading quote:', error);
            } finally {
                setLoading(false);
            }
        }

        loadUserAndQuote();
    }, [rfqId, partnerId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rfqId,
                    partnerId,
                    unitPrice: parseFloat(unitPrice),
                    currency,
                    leadTimeDays: parseInt(leadTimeDays),
                    moq: parseInt(moq),
                    productionCapacity: productionCapacity ? parseInt(productionCapacity) : null,
                    paymentTerms: paymentTerms.trim() || null,
                    shippingTerms: shippingTerms.trim() || null,
                    notes: notes.trim() || null,
                    validityDays: parseInt(validityDays),
                }),
            });

            if (res.ok) {
                const { quote } = await res.json();
                setExistingQuote(quote);
                onQuoteSubmitted?.();
                alert(existingQuote ? 'Quote updated successfully!' : 'Quote submitted successfully!');
            } else {
                const { error } = await res.json();
                alert(`Error: ${error}`);
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
            alert('Failed to submit quote');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="text-sm text-zinc-500">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                <p className="text-sm text-zinc-600">Please log in to submit a quote.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-zinc-900 mb-6">
                {existingQuote ? '📝 Update Your Quote' : '✨ Submit Quote'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pricing Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Pricing</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Unit Price *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="CNY">CNY</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Production Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Production</h4>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                MOQ *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={moq}
                                onChange={(e) => setMoq(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Lead Time (days) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={leadTimeDays}
                                onChange={(e) => setLeadTimeDays(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Capacity (units/month)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={productionCapacity}
                                onChange={(e) => setProductionCapacity(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="10000"
                            />
                        </div>
                    </div>
                </div>

                {/* Terms Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Terms</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Payment Terms
                            </label>
                            <input
                                type="text"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30% deposit, 70% before shipping"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Shipping Terms
                            </label>
                            <input
                                type="text"
                                value={shippingTerms}
                                onChange={(e) => setShippingTerms(e.target.value)}
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="FOB Shanghai"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        placeholder="Any additional information about your quote..."
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        {notes.length}/500 characters
                    </p>
                </div>

                {/* Validity */}
                <div className="w-48">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Quote Valid For (days)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={validityDays}
                        onChange={(e) => setValidityDays(e.target.value)}
                        className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {submitting ? 'Submitting...' : existingQuote ? 'Update Quote' : 'Submit Quote'}
                </button>

                {existingQuote && (
                    <p className="text-xs text-zinc-500 text-center">
                        Originally submitted on {new Date(existingQuote.created_at).toLocaleDateString()}
                    </p>
                )}
            </form>
        </div>
    );
}
