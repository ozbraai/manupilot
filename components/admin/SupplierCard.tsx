import { MoreVertical, Star, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

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
};

type Props = {
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onStatusChange: (id: string, status: string) => void;
};

export default function SupplierCard({ supplier, onEdit, onStatusChange }: Props) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const statusIcons = {
        pending: <Clock className="w-3 h-3 mr-1" />,
        verified: <CheckCircle className="w-3 h-3 mr-1" />,
        rejected: <XCircle className="w-3 h-3 mr-1" />,
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group">
            {supplier.is_featured && (
                <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
                    FEATURED
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Image */}
                <div className="h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                    {supplier.image_url ? (
                        <img src={supplier.image_url} alt={supplier.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">🏭</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate pr-6">{supplier.name}</h3>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{supplier.country || supplier.region || 'Unknown Location'}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[supplier.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusIcons[supplier.status]}
                            {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                        </span>
                        {supplier.rating && (
                            <span className="flex items-center text-xs text-amber-500 font-medium">
                                <Star className="w-3 h-3 fill-current mr-0.5" />
                                {supplier.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Capabilities */}
            <div className="mt-4 flex flex-wrap gap-1.5">
                {supplier.capabilities?.slice(0, 3).map((cap, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                        {cap}
                    </span>
                ))}
                {(supplier.capabilities?.length || 0) > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md border border-gray-100">
                        +{supplier.capabilities!.length - 3}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                    onClick={() => onEdit(supplier)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Edit Details
                </button>

                {supplier.status === 'pending' && (
                    <>
                        <button
                            onClick={() => onStatusChange(supplier.id, 'verified')}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onStatusChange(supplier.id, 'rejected')}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Reject
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
