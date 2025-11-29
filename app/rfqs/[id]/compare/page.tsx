'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import QuoteComparisonMatrix from '@/components/rfq/QuoteComparisonMatrix';
import AIInsightsPanel from '@/components/rfq/AIInsightsPanel';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';

export default function RFQComparePage() {
    const params = useParams();
    const router = useRouter();
    const rfqId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState<any[]>([]);
    const [rfqData, setRfqData] = useState<any>(null);
    const [projectTitle, setProjectTitle] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchData();
    }, [rfqId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch RFQ details
            const { data: rfq, error: rfqError } = await supabase
                .from('rfq_submissions')
                .select('*, project:projects(title)')
                .eq('id', rfqId)
                .single();

            if (rfqError) throw rfqError;
            setRfqData(rfq.rfq_data);
            setProjectTitle(rfq.project?.title || 'Untitled Project');

            // Fetch Responses via API
            const res = await fetch(`/api/rfq/${rfqId}/responses`);
            const data = await res.json();

            if (data.responses) {
                setResponses(data.responses);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMockResponse = async () => {
        // For demo purposes, add a mock response
        const mockManufacturers = [
            { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'TechMoulders Ltd' }, // Assuming these exist or we use random UUIDs if strict FK not enforced for demo
            { id: 'e390f1ee-6c54-4b01-90e6-d701748f0852', name: 'Global Precision' },
        ];

        // We need a real manufacturer ID from the DB ideally, but for now let's try to fetch one
        const { data: partners } = await supabase.from('partners').select('id, name').limit(1);
        const partner = partners?.[0];

        if (!partner) {
            alert('No partners found in DB to attach response to.');
            return;
        }

        const rawText = `
      Dear Customer,
      We are pleased to quote for your project.
      Unit Price: $12.50
      MOQ: 500 units
      Lead Time: 25 days
      Payment Terms: 30% deposit, 70% before shipping.
      Currency: USD
      Note: Tooling cost is $2000 one-time.
    `;

        try {
            const res = await fetch(`/api/rfq/${rfqId}/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manufacturerId: partner.id,
                    rawText,
                }),
            });
            const data = await res.json();

            if (data.response) {
                // Trigger Analysis
                await fetch('/api/rfq/analyze-response', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        responseId: data.response.id,
                        rawText,
                        targetPrice: rfqData?.targetPrice,
                        targetMoq: rfqData?.targetMoq,
                    }),
                });

                fetchData(); // Refresh
            }
        } catch (error) {
            console.error('Error adding mock response:', error);
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading comparison...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quote Comparison</h1>
                        <p className="text-sm text-gray-500">{projectTitle}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button
                        onClick={handleAddMockResponse}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={16} />
                        Add Mock Quote
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Matrix */}
                <div className="lg:col-span-3">
                    <QuoteComparisonMatrix
                        responses={responses}
                        targetPrice={rfqData?.targetPrice ? parseFloat(rfqData.targetPrice.replace(/[^0-9.]/g, '')) : undefined}
                        targetMoq={rfqData?.targetMoq ? parseInt(rfqData.targetMoq.replace(/[^0-9]/g, '')) : undefined}
                    />
                </div>

                {/* Sidebar Insights */}
                <div className="lg:col-span-1">
                    <AIInsightsPanel responses={responses} />
                </div>
            </div>
        </div>
    );
}
