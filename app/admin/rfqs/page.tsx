'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, XCircle, Send } from 'lucide-react';
import RFQDrawer from '@/components/admin/RFQDrawer';

type RFQ = {
    id: string;
    created_at: string;
    status: string;
    project: {
        id: string;
        title: string;
    };
    owner: {
        id: string;
        email: string;
    };
    matches_count: number;
    rfq_data: any;
};

export default function RFQsPage() {
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Drawer
    const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        fetchRfqs();
    }, []);

    async function fetchRfqs() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rfqs');
            const data = await res.json();
            if (data.rfqs) {
                setRfqs(data.rfqs);
            }
        } catch (error) {
            console.error('Failed to fetch RFQs:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(id: string, newStatus: string) {
        if (!confirm(`Are you sure you want to mark this RFQ as ${newStatus}?`)) return;

        try {
            const res = await fetch('/api/admin/rfqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                setRfqs(rfqs.map(r => r.id === id ? { ...r, status: newStatus } : r));
                if (selectedRfq?.id === id) {
                    setSelectedRfq({ ...selectedRfq, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update status');
        }
    }

    const filteredRfqs = rfqs.filter(rfq => {
        const matchesSearch =
            rfq.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rfq.owner.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">RFQs</h1>
                    <p className="mt-1 text-sm text-gray-500">Monitor and manage Request for Quotes sent to suppliers.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search projects or owners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="completed">Completed</option>
                        <option value="invalidated">Invalidated</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    RFQ ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matches
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sent Date
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading RFQs...
                                    </td>
                                </tr>
                            ) : filteredRfqs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No RFQs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRfqs.map((rfq) => (
                                    <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs text-gray-500">{rfq.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{rfq.project.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{rfq.owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rfq.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                    rfq.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {rfq.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Send className="w-3 h-3" />
                                                {rfq.matches_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(rfq.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRfq(rfq);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                {rfq.status !== 'invalidated' && (
                                                    <button
                                                        onClick={() => handleStatusChange(rfq.id, 'invalidated')}
                                                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                        title="Invalidate RFQ"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            <RFQDrawer
                rfq={selectedRfq}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
}
