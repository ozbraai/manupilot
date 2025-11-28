'use client';

import React from 'react';

type PlaybookTimelineNextProps = {
  timeline?: string[];
  nextSteps?: string[];
  preview?: boolean;
  variant?: 'split' | 'single';
};

export default function PlaybookTimelineNext({
  timeline = [],
  nextSteps = [],
  preview = false,
  variant = 'split'
}: PlaybookTimelineNextProps) {

  const hasTimeline = timeline.length > 0;
  const hasNextSteps = nextSteps.length > 0;

  const isSingle = variant === 'single';

  const LeftWrapper = isSingle ? 'div' : 'section';
  const RightWrapper = isSingle ? 'div' : 'section';

  const leftClasses = isSingle ? '' : 'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm';
  const rightClasses = isSingle ? '' : 'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full';

  return (
    <div className={isSingle ? "bg-white border border-slate-200 rounded-2xl p-8 shadow-sm" : "grid md:grid-cols-2 gap-6"}>
      <div className={isSingle ? "grid md:grid-cols-2 gap-12" : "contents"}>

        {/* === LEFT: TIMELINE (NPI STAGES) === */}
        <LeftWrapper className={leftClasses}>
          <h3 className="text-base font-semibold text-slate-900 mb-4">🗓️ Execution Roadmap</h3>

          {hasTimeline ? (
            <>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                {(preview ? timeline.slice(0, 5) : timeline).map((phase, idx) => (
                  <div key={idx} className="relative pl-8">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                    <h4 className="text-sm font-bold text-slate-800">{phase}</h4>
                  </div>
                ))}
              </div>

              {preview && !isSingle && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 italic text-center">
                    Your project includes detailed timelines, budgets, and checklists.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">No timeline generated.</p>
          )}
        </LeftWrapper>

        {/* === RIGHT: IMMEDIATE ACTIONS === */}
        <RightWrapper className={rightClasses}>
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
        </RightWrapper>
      </div>

      {preview && isSingle && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500 italic text-center">
            Your project includes detailed timelines, budgets, and checklists tailored to your product.
          </p>
        </div>
      )}
    </div>
  );
}