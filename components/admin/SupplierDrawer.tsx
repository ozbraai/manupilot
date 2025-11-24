import { useState, useEffect } from 'react';
import { X, Save, Trash2, ExternalLink } from 'lucide-react';

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

type Props = {
    supplier: Supplier | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Supplier>) => Promise<void>;
};

export default function SupplierDrawer({ supplier, isOpen, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Partial<Supplier>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                status: supplier.status,
                notes: supplier.notes || '',
                is_featured: supplier.is_featured,
                industry: supplier.industry || '',
            });
        }
    }, [supplier]);

    if (!isOpen || !supplier) return null;

    async function handleSave() {
        setSaving(true);
        try {
            await onSave(supplier!.id, formData);
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Supplier</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Profile Summary */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                            {supplier.image_url ? (
                                <img src={supplier.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xl">🏭</span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                            <p className="text-xs text-gray-500">{supplier.country || supplier.region}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Verification Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <span className="block text-sm font-medium text-gray-900">Featured Supplier</span>
                            <span className="block text-xs text-gray-500">Highlight this supplier in the marketplace</span>
                        </div>
                        <button
                            onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_featured ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_featured ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Industry</label>
                        <select
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Industry...</option>
                            <option value="electronics">Electronics</option>
                            <option value="furniture">Furniture</option>
                            <option value="textiles">Textiles</option>
                            <option value="metals">Metals & Machining</option>
                            <option value="plastics">Plastics</option>
                            <option value="packaging">Packaging</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                        <textarea
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Internal notes about this supplier..."
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Metadata Read-only */}
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">System Data</h4>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <dt className="text-gray-500">ID</dt>
                            <dd className="text-gray-900 font-mono truncate">{supplier.id}</dd>
                            <dt className="text-gray-500">Rating</dt>
                            <dd className="text-gray-900">{supplier.rating?.toFixed(1) || 'N/A'}</dd>
                            <dt className="text-gray-500">Capabilities</dt>
                            <dd className="text-gray-900 col-span-2">{supplier.capabilities?.join(', ') || 'None'}</dd>
                        </dl>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
