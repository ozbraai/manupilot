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
      {/* === [2.1] TITLE === */}
      <h2 className="text-lg font-semibold text-slate-900">
        🧩 Components & supplier strategy
      </h2>

      {/* === [2.2] SUMMARY === */}
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

      {/* === [2.3] SUB-PRODUCTS === */}
      {subProducts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
            Sub-products
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {subProducts.map((sp: string, idx: number) => (
              <li key={idx}>{sp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* === [2.4] COMPONENT LIST === */}
      {componentList.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
            Components
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {componentList.map((c: string, idx: number) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* === [2.5] SUPPLIER TYPES === */}
      {supplierTypes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
            Supplier types
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {supplierTypes.map((s: string, idx: number) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* === [2.6] NOTES === */}
      {notes && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
            Notes
          </h3>
          <p className="text-sm text-slate-700">{notes}</p>
        </div>
      )}
    </section>
  );
}