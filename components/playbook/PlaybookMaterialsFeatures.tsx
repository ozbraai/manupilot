'use client';

import React from 'react';

type PlaybookMaterialsFeaturesProps = {
  materials?: string[];
  features?: string[];
  onUpdate: (key: string, value: any) => void;
  preview?: boolean;
};

export default function PlaybookMaterialsFeatures({
  materials = [],
  features = [],
  onUpdate,
  preview = false
}: PlaybookMaterialsFeaturesProps) {

  // Simple rendering for now - can add editing logic similar to KeyInfo if needed
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
      <h3 className="text-base font-semibold text-slate-900 mb-4">🏗️ Materials & Features</h3>

      <div className="space-y-5">
        {/* Materials */}
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Key Materials</p>
          {materials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {materials.map((mat, idx) => (
                <span key={idx} className="px-3 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700">
                  {mat}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No specific materials listed.</p>
          )}
        </div>

        {/* Features */}
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Core Features</p>
          {features.length > 0 ? (
            <ul className="space-y-1">
              {(preview ? features.slice(0, 4) : features).map((f, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No features listed.</p>
          )}
        </div>
      </div>

      {preview && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic text-center">
            A complete bill of materials and component list becomes available once this playbook is converted into a project.
          </p>
        </div>
      )}
    </section>
  );
}