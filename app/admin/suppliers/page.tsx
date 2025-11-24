'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import SupplierCard from '@/components/admin/SupplierCard';
import SupplierTable from '@/components/admin/SupplierTable';
import SupplierDrawer from '@/components/admin/SupplierDrawer';

type Supplier = {
    id: string;
    name: string;
    image_url?: string;
    region?: string;
    country?: string;
    rating?: number;
    capabilities?: string[];
    status: 'pending' | 'verified' | 'rejected';
    is_featured: boolean;
    industry?: string;
    notes?: string;
    certificates?: any[];
};

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');

    // Drawer
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, [statusFilter, industryFilter]);

    async function fetchSuppliers() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (industryFilter !== 'all') params.append('industry', industryFilter);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/admin/suppliers?${params.toString()}`);
            const data = await res.json();
            if (data.suppliers) {
                setSuppliers(data.suppliers);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setLoading(false);
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSuppliers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    async function handleUpdate(id: string, updates: Partial<Supplier>) {
        try {
            const res = await fetch('/api/admin/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updates }),
            });

            if (res.ok) {
                const { supplier: updated } = await res.json();
                setSuppliers(suppliers.map(s => s.id === id ? updated : s));
                if (selectedSupplier?.id === id) {
                    setSelectedSupplier(updated);
                }
            }
        } catch (error) {
            console.error('Update failed:', error);
            throw error;
        }
    }

    const stats = {
        total: suppliers.length,
        pending: suppliers.filter(s => s.status === 'pending').length,
        verified: suppliers.filter(s => s.status === 'verified').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage supplier onboarding and verification.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Pending Review</div>
                    <div className="mt-1 text-2xl font-semibold text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Verified Partners</div>
                    <div className="mt-1 text-2xl font-semibold text-green-600">{stats.verified}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Total Suppliers</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</div>
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
                        placeholder="Search suppliers..."
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
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="all">All Industries</option>
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                        <option value="textiles">Textiles</option>
                        <option value="metals">Metals</option>
                        <option value="plastics">Plastics</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading suppliers...</div>
            ) : suppliers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No suppliers found matching your filters.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                        <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            onEdit={(s) => {
                                setSelectedSupplier(s);
                                setIsDrawerOpen(true);
                            }}
                            onStatusChange={(id, status) => handleUpdate(id, { status: status as any })}
                        />
                    ))}
                </div>
            ) : (
                <SupplierTable
                    suppliers={suppliers}
                    onEdit={(s) => {
                        setSelectedSupplier(s);
                        setIsDrawerOpen(true);
                    }}
                    onStatusChange={(id, status) => handleUpdate(id, { status: status as any })}
                />
            )}

            {/* Drawer */}
            <SupplierDrawer
                supplier={selectedSupplier}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={handleUpdate}
            />
        </div>
    );
}
