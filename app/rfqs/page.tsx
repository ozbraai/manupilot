'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import RFQCard from '@/components/rfq/RFQCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function RFQDashboard() {
    const router = useRouter();
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        async function loadRFQs() {
            setLoading(true);

            // Fetch RFQs with Project details
            const { data, error } = await supabase
                .from('rfq_submissions')
                .select(`
          *,
          project:projects (
            title
          )
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading RFQs:', error);
            } else {
                setRfqs(data || []);
            }
            setLoading(false);
        }

        loadRFQs();
    }, []);

    // Filter Logic
    const filteredRfqs = rfqs.filter(rfq => {
        const matchesSearch = rfq.project?.title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20">
            {/* HERO SECTION */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                            RFQ Dashboard
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-xl">
                            Track and manage your Requests for Quotation. View status, details, and supplier responses.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by project..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                        {(['all', 'submitted', 'draft', 'completed'] as const).map((key) => {
                            const active = statusFilter === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* GRID */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredRfqs.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                            <FunnelIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No RFQs found</h3>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                            {search || statusFilter !== 'all'
                                ? "Try adjusting your filters."
                                : "You haven't submitted any RFQs yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRfqs.map(rfq => (
                            <RFQCard key={rfq.id} rfq={rfq} />
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}
