'use client';

import React from 'react';

type Financials = {
  complexityTier?: string;
  unitEconomics?: {
    exWorksCost?: string;
    freightCost?: string;
    landedCost?: string;
    retailPrice?: string;
    grossMargin?: string;
  };
  startupCapital?: {
    tooling?: string;
    prototyping?: string;
    certification?: string;
    firstBatchCost?: string;
    totalLaunchBudget?: string;
  };
  hiddenCosts?: string[];
  logisticDetails?: {
    tariffCode?: string;
    dutyRate?: string;
  };
};

export default function PlaybookFinancials({ financials }: { financials: Financials }) {
  if (!financials) return null;

  const exWorks = financials.unitEconomics?.exWorksCost;
  const retail = financials.unitEconomics?.retailPrice;
  const margin = financials.unitEconomics?.grossMargin;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          💸 Financial Feasibility
        </h3>
        {financials.complexityTier && (
          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-white shadow-sm">
            {financials.complexityTier}
          </span>
        )}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LEFT: UNIT ECONOMICS */}
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-4">
            📦 Unit Economics (Per Item)
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Factory Price (Ex-Works)</span>
              <span className="font-medium">{exWorks || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Est. Freight & Duty</span>
              <span className="font-medium">
                {financials.unitEconomics?.freightCost ? `+ ${financials.unitEconomics.freightCost}` : '+ TBD'}
              </span>
            </div>
            
            <div className="h-px bg-emerald-200 w-full my-2" />
            
            <div className="flex justify-between text-slate-800 font-semibold">
              <span>Landed Cost</span>
              <span>{financials.unitEconomics?.landedCost || '-'}</span>
            </div>
            
            <div className="flex justify-between text-slate-500 pt-2">
              <span>Target Retail</span>
              <span>{retail || '-'}</span>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg p-3 border border-emerald-100 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-emerald-800 uppercase">Gross Margin</span>
            <span className="text-lg font-bold text-emerald-600">{margin || '-'}</span>
          </div>
        </div>

        {/* RIGHT: STARTUP CAPITAL */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col h-full">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            🚀 Startup Capital (NRE)
          </h4>
          
          <div className="space-y-3 text-sm flex-1">
            <div className="flex justify-between text-slate-600">
              <span>R&D & Prototyping</span>
              <span className="font-medium">{financials.startupCapital?.prototyping || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tooling & Molds</span>
              <span className="font-medium text-amber-600">{financials.startupCapital?.tooling || '-'}</span>
            </div>
             <div className="flex justify-between text-slate-600">
              <span>Certifications</span>
              <span className="font-medium">{financials.startupCapital?.certification || '-'}</span>
            </div>
             <div className="flex justify-between text-slate-600">
              <span>First Inventory Batch</span>
              <span className="font-medium">{financials.startupCapital?.firstBatchCost || '-'}</span>
            </div>
            
            <div className="h-px bg-slate-300 w-full my-2" />
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Launch Budget</span>
              <span className="text-lg font-bold text-slate-900">{financials.startupCapital?.totalLaunchBudget || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: HIDDEN COSTS SECTION */}
      {financials.hiddenCosts && financials.hiddenCosts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">⚠️ Hidden Costs to Consider</p>
            <div className="flex flex-wrap gap-2">
                {financials.hiddenCosts.map((cost, idx) => (
                    <span key={idx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100">
                        {cost}
                    </span>
                ))}
            </div>
        </div>
      )}
      
      {financials.logisticDetails?.dutyRate && (
         <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-400">
            <p>HS Code: <span className="text-slate-600">{financials.logisticDetails.tariffCode || 'TBD'}</span></p>
            <p>Duty Rate: <span className="text-slate-600">{financials.logisticDetails.dutyRate}</span></p>
         </div>
      )}
    </section>
  );
}