import { MoreVertical, Star, MapPin, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';

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
    created_at?: string;
};

type Props = {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    onStatusChange: (id: string, status: string) => void;
};

export default function SupplierTable({ suppliers, onEdit, onStatusChange }: Props) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supplier
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Industry / Capabilities
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {supplier.image_url ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={supplier.image_url} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">🏭</div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {supplier.name}
                                                {supplier.is_featured && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">ID: {supplier.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[supplier.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {supplier.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplier.country || supplier.region || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{supplier.industry || 'General'}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                        {supplier.capabilities?.slice(0, 3).join(', ')}
                                        {(supplier.capabilities?.length || 0) > 3 && '...'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplier.rating ? (
                                        <div className="flex items-center text-amber-500">
                                            <Star className="w-4 h-4 fill-current mr-1" />
                                            {supplier.rating.toFixed(1)}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(supplier)}
                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {supplier.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => onStatusChange(supplier.id, 'verified')}
                                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onStatusChange(supplier.id, 'rejected')}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
