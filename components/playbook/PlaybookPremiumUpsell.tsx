'use client';

import React from 'react';

interface PlaybookPremiumUpsellProps {
  onCreateProject: () => void;
  creatingProject: boolean;
}

export default function PlaybookPremiumUpsell({ onCreateProject, creatingProject }: PlaybookPremiumUpsellProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🚀</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Unlock Full Plan
          </h3>
        </div>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Turn this snapshot into a comprehensive manufacturing plan. Get detailed financials, execution roadmaps, and supplier readiness tools.
        </p>

        <ul className="space-y-3 mb-8">
          {[
            'Full financial breakdown & margin analysis',
            'Detailed manufacturing roadmap & timeline',
            'Supplier sourcing & QC checklists',
            'Risk mitigation strategies'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
              <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onCreateProject}
          disabled={creatingProject}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {creatingProject ? 'Creating Project...' : 'Unlock Full Intelligence'}
        </button>
      </div>
    </div>
  );
}