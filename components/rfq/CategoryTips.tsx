'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface CategoryTipsProps {
    category?: string;
}

export default function CategoryTips({ category = 'General' }: CategoryTipsProps) {
    // Mock tips database - in a real app this might come from an API or config
    const tips = {
        'Outdoor Furniture': [
            'Ask about UV resistance and weatherproofing standards (e.g., ISO 4892).',
            'Confirm load-bearing capacity and request safety test reports.',
            'Ask about fabric denier, coating types (PU/PVC), and color fastness.',
            'Ask about their defect rate (AQL) policy and warranty terms.',
            'Confirm payment terms for the first order (typically 30% deposit).',
            'Ask if they have experience exporting to your target market (EU/US).'
        ],
        'Electronics': [
            'Request certifications (CE, FCC, RoHS) upfront.',
            'Ask about their PCB assembly (SMT) capabilities and QC process.',
            'Confirm warranty terms and spare parts policy (usually 1-2%).',
            'Ask about firmware flashing and testing procedures.'
        ],
        'Apparel': [
            'Ask for fabric swatches and GSM (grams per square meter) details.',
            'Confirm sizing charts and tolerance limits.',
            'Ask about their sample lead time and revision policy.',
            'Check if they have Oeko-Tex or organic certifications.'
        ],
        'General': [
            'Ask for their business license and export license.',
            'Confirm their MOQ and lead times for samples vs. mass production.',
            'Ask about their quality control process (IQC, IPQC, FQC).',
            'Request references from current clients in your region.'
        ]
    };

    const selectedTips = tips[category as keyof typeof tips] || tips['General'];

    return (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Before you send RFQs for {category}
                    </h3>
                    <p className="text-slate-600 mb-4">
                        Suppliers in this category expect specific questions. Include these to look like a pro:
                    </p>
                    <ul className="space-y-2">
                        {selectedTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
