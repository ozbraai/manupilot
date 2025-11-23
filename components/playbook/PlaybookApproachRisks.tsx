 'use client';

import React, { useState } from 'react';

type PlaybookApproachRisksProps = {
  approach?: string[];
  risks?: string[];
  dfmWarnings?: string[];
  complianceTasks?: string[];
};

export default function PlaybookApproachRisks({ 
  approach = [], 
  risks = [], 
  dfmWarnings = [], 
  complianceTasks = [] 
}: PlaybookApproachRisksProps) {
  
  // Helper to check if we have data
  const hasApproach = approach.length > 0;
  const hasRisks = risks.length > 0;
  const hasDfm = dfmWarnings.length > 0;
  const hasCompliance = complianceTasks.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* === LEFT: APPROACH & COMPLIANCE === */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        
        {/* Manufacturing Approach */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-3">⚙️ Manufacturing Approach</h3>
          {hasApproach ? (
            <ul className="space-y-2">
              {approach.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No detailed approach generated.</p>
          )}
        </div>

        {/* Compliance (If available) */}
        {hasCompliance && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">⚖️ Compliance Requirements</h3>
            <ul className="space-y-2">
              {complianceTasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* === RIGHT: RISKS & DFM === */}
      <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        
        {/* Commercial Risks */}
        <div>
          <h3 className="text-base font-semibold text-amber-900 mb-3">⚠️ Risks to Watch</h3>
          {hasRisks ? (
            <ul className="space-y-2">
              {risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-700/60 italic">No specific risks flagged.</p>
          )}
        </div>

        {/* DFM Warnings */}
        {hasDfm && (
          <div className="pt-4 border-t border-amber-200/60">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">🛠️ DFM Warnings (Engineering)</h3>
            <ul className="space-y-2">
              {dfmWarnings.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}