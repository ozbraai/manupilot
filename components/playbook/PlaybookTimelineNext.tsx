'use client';

import React from 'react';

type PlaybookTimelineNextProps = {
  timeline?: string[];
  nextSteps?: string[];
};

export default function PlaybookTimelineNext({ 
  timeline = [], 
  nextSteps = [] 
}: PlaybookTimelineNextProps) {

  const hasTimeline = timeline.length > 0;
  const hasNextSteps = nextSteps.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* === LEFT: TIMELINE (NPI STAGES) === */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">🗓️ Execution Roadmap</h3>
        
        {hasTimeline ? (
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
            {timeline.map((step, idx) => {
                // Try to split "Stage: Detail"
                const parts = step.split(':');
                const title = parts[0];
                const detail = parts.slice(1).join(':');

                return (
                  <div key={idx} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-sky-500" />
                    
                    <div>
                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide">{title}</p>
                        <p className="text-sm text-slate-700 mt-0.5">{detail || step}</p>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No timeline generated.</p>
        )}
      </section>

      {/* === RIGHT: IMMEDIATE ACTIONS === */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
        <h3 className="text-base font-semibold text-slate-900 mb-4">✅ Critical Next Steps</h3>
        
        {hasNextSteps ? (
          <div className="space-y-3">
            {nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No next steps suggested.</p>
        )}
      </section>
    </div>
  );
}