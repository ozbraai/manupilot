'use client';

import React from 'react';

type BOMItem = {
  partName: string;
  material: string;
  process: string;
  qty: number;
};

export default function PlaybookBOM({ bom }: { bom?: BOMItem[] }) {
  if (!bom || bom.length === 0) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          🏗️ Draft Bill of Materials (BOM)
        </h3>
        <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wide">
          Est. Parts: {bom.length}
        </span>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Component</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Material</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Process</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {bom.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.partName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.material}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.process}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right font-mono">{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 flex gap-2 items-start">
        <span className="text-xs text-amber-500 mt-0.5">⚠️</span>
        <p className="text-xs text-slate-500 leading-relaxed">
          This is an AI-estimated BOM for planning purposes. You will need to refine this technical list with an engineer before creating your formal RFQ.
        </p>
      </div>
    </section>
  );
}