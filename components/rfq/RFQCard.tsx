import React from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

type RFQCardProps = {
    rfq: {
        id: string;
        project_id: string;
        created_at: string;
        status: string;
        rfq_data: any;
        quote_count?: number;
        project: {
            title: string;
        };
    };
};

export default function RFQCard({ rfq }: RFQCardProps) {
    const router = useRouter();
    const { project, status, created_at, rfq_data } = rfq;

    // Format Date
    const date = new Date(created_at).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    // Status Colors
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'submitted': return 'bg-blue-500';
            case 'draft': return 'bg-slate-300';
            case 'completed': return 'bg-emerald-500';
            default: return 'bg-slate-300';
        }
    };

    const statusColor = getStatusColor(status);
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <div
            onClick={() => router.push(`/rfqs/${rfq.id}`)} // Navigate to dedicated RFQ detail page
            className="group relative bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-blue-100/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                    {statusLabel}
                </span>
                <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                    <DocumentTextIcon className="h-4 w-4" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project?.title || 'Untitled Project'}
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                    {rfq_data?.sourcingMode === 'white-label' ? 'Private Label (ODM)' : 'Custom Mfg (OEM)'}
                </p>

                <div className="space-y-1 text-sm text-slate-600">
                    <p>Target Price: <span className="font-medium text-slate-900">{rfq_data?.targetPrice || 'N/A'}</span></p>
                    <p>MOQ: <span className="font-medium text-slate-900">{rfq_data?.targetMoq || 'N/A'}</span></p>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-50 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Ref: {rfq.id.slice(0, 8)}</span>
                    <div className="flex items-center gap-2">
                        {rfq.quote_count !== undefined && (
                            <span className={`font-medium ${rfq.quote_count > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                {rfq.quote_count} {rfq.quote_count === 1 ? 'Quote' : 'Quotes'}
                            </span>
                        )}
                        <span>•</span>
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
