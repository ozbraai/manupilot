import { X, FileText, HelpCircle, Users } from 'lucide-react';

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

type Props = {
    rfq: RFQ | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function RFQDrawer({ rfq, isOpen, onClose }: Props) {
    if (!isOpen || !rfq) return null;

    const data = rfq.rfq_data || {};

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">RFQ Details</h2>
                        <p className="text-xs text-gray-500 font-mono">{rfq.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Project Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">{rfq.project.title}</h3>
                                <p className="text-sm text-blue-700 mt-1">Owner: {rfq.owner.email}</p>
                                <p className="text-xs text-blue-500 mt-2">
                                    Sent: {new Date(rfq.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Key Specs */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Target Price</p>
                                <p className="font-medium text-gray-900">{data.targetPrice || 'Not set'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Target MOQ</p>
                                <p className="font-medium text-gray-900">{data.targetMoq || 'Not set'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Sourcing Mode</p>
                                <p className="font-medium text-gray-900 capitalize">{data.sourcingMode || 'Custom'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Packaging</p>
                                <p className="font-medium text-gray-900">{data.includePackaging ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Supplier Questions</h3>
                        </div>
                        <div className="space-y-2">
                            {data.questions?.map((q: string, i: number) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                                    {q}
                                </div>
                            )) || <p className="text-sm text-gray-500 italic">No specific questions asked.</p>}
                        </div>
                    </div>

                    {/* Matches */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Matched Suppliers ({rfq.matches_count})</h3>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                            {data.matched_partner_ids?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {data.matched_partner_ids.map((id: string) => (
                                        <span key={id} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-600">
                                            {id.slice(0, 8)}...
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No suppliers matched automatically.</p>
                            )}
                        </div>
                    </div>

                    {/* Raw Data */}
                    <div className="pt-4 border-t border-gray-100">
                        <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                <span>View Raw Data</span>
                            </summary>
                            <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </details>
                    </div>

                </div>
            </div>
        </div>
    );
}
