// components/project/ProjectComponents.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectComponentsProps = {
  free: any;
};

// === [2] COMPONENT ROOT ===
export default function ProjectComponents({ free }: ProjectComponentsProps) {
  const components = free?.components || null;

  if (!components) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          🧩 Components & supplier strategy
        </h2>
        <p className="text-sm text-slate-600">
          No component breakdown has been generated yet for this project.
        </p>
      </section>
    );
  }

  const {
    estimatedComponentCount,
    subProducts = [],
    componentList = [],
    supplierTypes = [],
    notes,
  } = components;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
      {/* === [2.1] TITLE + SUMMARY === */}
      <h2 className="text-lg font-semibold text-slate-900">
        🧩 Components & supplier strategy
      </h2>

      <p className="text-sm text-slate-700">
        This product appears to consist of approximately{' '}
        <span className="font-semibold">
          {estimatedComponentCount ?? 'N/A'}
        </span>{' '}
        components and may be better treated as{' '}
        {subProducts.length > 0
          ? `${subProducts.length} sub-product${subProducts.length > 1 ? 's' : ''}.`
          : 'a multi-component assembly.'}
      </p>

      {/* === [2.2] GRID OF INNER BLOCKS === */}
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {/* Sub-products */}
        {subProducts.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Sub-products
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {subProducts.map((sp: string, idx: number) => (
                <li key={idx}>{sp}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Component list */}
        {componentList.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Components
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto">
              {componentList.map((c: string, idx: number) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Supplier types */}
        {supplierTypes.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Supplier types
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {supplierTypes.map((s: string, idx: number) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Notes
            </h3>
            <p className="text-sm text-slate-700">{notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}