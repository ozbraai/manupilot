// components/project/ProjectPlaybookModal.tsx

'use client';

import React from 'react';

// === [1] TYPES ===
type ProjectPlaybookModalProps = {
  show: boolean;
  setShow: (open: boolean) => void;
  free: any | null | undefined;     // free playbook section
  project: any;                     // full project object
};

// === [2] COMPONENT ROOT ===
export default function ProjectPlaybookModal({
  show,
  setShow,
  free,
  project,
}: ProjectPlaybookModalProps) {
  if (!show || !free) return null;

  const productName = free?.productName || project?.title || 'This product';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* === [2.1] HEADER === */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Full Playbook – {project?.title || 'Project'}
          </h2>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Close ✕
          </button>
        </div>

        {/* === [2.2] BODY === */}
        <div className="px-6 py-4 overflow-y-auto max-h-[70vh] space-y-4 text-sm text-slate-800">
          {/* Summary */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Summary</h3>
            <p>{free.summary || 'No summary available.'}</p>
          </section>

          {/* Target customer */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">
              Target customer
            </h3>
            <p>{free.targetCustomer || 'Not defined.'}</p>
          </section>

          {/* Key features */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">
              Key features
            </h3>
            {free.keyFeatures?.length ? (
              <ul className="list-disc list-inside">
                {free.keyFeatures.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p>No key features captured.</p>
            )}
          </section>

          {/* Materials */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Materials</h3>
            {free.materials?.length ? (
              <ul className="list-disc list-inside">
                {free.materials.map((material: string, idx: number) => (
                  <li key={idx}>{material}</li>
                ))}
              </ul>
            ) : (
              <p>No materials captured.</p>
            )}
          </section>

          {/* Manufacturing approach */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">
              Manufacturing approach
            </h3>
            <p className="mb-1">
              <span className="font-medium">Regions:</span>{' '}
              {free.manufacturingApproach?.recommendedRegions?.length
                ? free.manufacturingApproach.recommendedRegions.join(', ')
                : 'None specified'}
            </p>
            <p className="mb-1">
              <span className="font-medium">Rationale:</span>{' '}
              {free.manufacturingApproach?.rationale || 'Not provided.'}
            </p>
            {free.manufacturingApproach?.risks?.length > 0 && (
              <div className="mt-1">
                <span className="font-medium">Risks:</span>
                <ul className="list-disc list-inside">
                  {free.manufacturingApproach.risks.map(
                    (risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </section>

          {/* Pricing & positioning */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">
              Pricing & positioning
            </h3>
            <p className="mb-1">
              <span className="font-medium">Positioning:</span>{' '}
              {free.pricing?.positioning || 'Not set.'}
            </p>
            <p>
              <span className="font-medium">Insight:</span>{' '}
              {free.pricing?.insight || 'No additional insight.'}
            </p>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Timeline</h3>
            {free.timeline?.length ? (
              <ul className="list-disc list-inside">
                {free.timeline.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No timeline available.</p>
            )}
          </section>

          {/* Next steps */}
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Next steps</h3>
            {free.nextSteps?.length ? (
              <ul className="list-disc list-inside">
                {free.nextSteps.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            ) : (
              <p>No next steps available.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}