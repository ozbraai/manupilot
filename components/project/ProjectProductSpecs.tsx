'use client';

import React from 'react';
import { PlaybookV2 } from '@/types/playbook';

type ProjectProductSpecsProps = {
    playbook: PlaybookV2;
};

export default function ProjectProductSpecs({ playbook }: ProjectProductSpecsProps) {
    if (!playbook) return null;

    const {
        coreProduct,
        subProducts = [],
        componentsInfo,
        free
    } = playbook;

    const materials = free?.materials || [];
    const keyFeatures = free?.keyFeatures || [];
    const componentsMap = componentsInfo?.components || {};
    const supplierTypes = componentsInfo?.supplierTypes || [];

    // Helper to get display name for a component section key
    const getSectionTitle = (key: string) => {
        if (key === 'core') return `${coreProduct} (Core Product)`;
        const sub = subProducts.find(sp => sp.id === key);
        return sub ? `${sub.label} (${sub.role || 'Sub-product'})` : key;
    };

    return (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm space-y-6">

            {/* 1. PRODUCT STRUCTURE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                        Product Structure
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{coreProduct}</h2>
                        <span className="text-sm text-slate-500">
                            {subProducts.length > 0 ? `+ ${subProducts.length} sub-products` : '(Single assembly)'}
                        </span>
                    </div>
                </div>

                {subProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {subProducts.map((sp) => (
                            <div key={sp.id} className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1">
                                <span className="text-xs font-medium text-slate-700 mr-2">{sp.label}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {sp.role || 'Accessory'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. MATERIALS & FEATURES */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Materials */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
                        Key Materials
                    </h4>
                    {materials.length > 0 ? (
                        <ul className="space-y-2">
                            {materials.map((mat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                    <span>{mat}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No materials specified yet.</p>
                    )}
                </div>

                {/* Features */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
                        Key Features
                    </h4>
                    {keyFeatures.length > 0 ? (
                        <ul className="space-y-2">
                            {keyFeatures.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No features listed yet.</p>
                    )}
                </div>
            </div>

            {/* 3. COMPONENT BREAKDOWN */}
            <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">
                    Component Breakdown
                </h4>
                {Object.keys(componentsMap).length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(componentsMap).map(([key, items]) => (
                            <div key={key} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
                                    {getSectionTitle(key)}
                                </h5>
                                <ul className="space-y-1.5">
                                    {items.map((item, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                            <span className="text-slate-300">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                        No component breakdown available.
                    </div>
                )}
            </div>

            {/* 4. SUPPLIER TYPES */}
            <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800 mb-3">
                    Manufacturing & Supply Chain
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                    Based on the components above, your supply chain will likely involve these facility types:
                </p>
                {supplierTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {supplierTypes.map((type, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-sky-200 text-xs font-medium text-sky-700 shadow-sm">
                                {type}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic">No supplier types identified.</p>
                )}
            </div>

        </section>
    );
}
