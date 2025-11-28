// components/playbook/PlaybookHeader.tsx

'use client';

import React, { useState } from 'react';
import { WizardInput } from '@/types/playbook';

// === [1] TYPES ===
type PlaybookHeaderProps = {
  productName: string;
  summary: string;
  projectImage?: string;
  wizardInput?: WizardInput;
  onUpdateSummary: (value: string) => void;
  onUpdateWizardInput?: (wizardInput: WizardInput) => void;
};

// === [2] COMPONENT ROOT ===
export default function PlaybookHeader({
  productName,
  summary,
  projectImage,
  wizardInput,
  onUpdateSummary,
  onUpdateWizardInput,
}: PlaybookHeaderProps) {
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingWizardInput, setIsEditingWizardInput] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(summary);
  const [wizardDraft, setWizardDraft] = useState<WizardInput>({
    originalIdea: wizardInput?.originalIdea || '',
    referenceLink: wizardInput?.referenceLink || '',
    referenceImage: wizardInput?.referenceImage || '',
    designStage: wizardInput?.designStage || '',
  });

  // Sync when summary changes externally
  React.useEffect(() => {
    if (!isEditingSummary) setSummaryDraft(summary);
  }, [summary, isEditingSummary]);

  // Sync wizard input
  React.useEffect(() => {
    if (!isEditingWizardInput && wizardInput) {
      setWizardDraft({
        originalIdea: wizardInput.originalIdea || '',
        referenceLink: wizardInput.referenceLink || '',
        referenceImage: wizardInput.referenceImage || '',
        designStage: wizardInput.designStage || '',
      });
    }
  }, [wizardInput, isEditingWizardInput]);

  function handleSaveSummary() {
    onUpdateSummary(summaryDraft.trim());
    setIsEditingSummary(false);
  }

  function handleCancelSummary() {
    setSummaryDraft(summary);
    setIsEditingSummary(false);
  }

  function handleSaveWizardInput() {
    if (onUpdateWizardInput) {
      onUpdateWizardInput(wizardDraft);
      setIsEditingWizardInput(false);
    }
  }

  function handleCancelWizardInput() {
    setWizardDraft({
      originalIdea: wizardInput?.originalIdea || '',
      referenceLink: wizardInput?.referenceLink || '',
      referenceImage: wizardInput?.referenceImage || '',
      designStage: wizardInput?.designStage || '',
    });
    setIsEditingWizardInput(false);
  }

  return (
    <section className="mt-10 bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      {/* === [2.1] TITLE BAR === */}
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
        Manufacturing Playbook
      </p>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Thumbnail */}
          {projectImage && (
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={projectImage}
                alt={`${productName} thumbnail`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              {productName || 'Untitled product'}
            </h1>
          </div>
        </div>
      </div>

      {/* === [2.2] YOUR ORIGINAL IDEA === */}
      {wizardInput && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              💡 Your Original Idea
            </h3>
            {!isEditingWizardInput && onUpdateWizardInput && (
              <button
                type="button"
                onClick={() => setIsEditingWizardInput(true)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {!isEditingWizardInput ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">{wizardInput.originalIdea || 'No idea description provided.'}</p>
              {wizardInput.referenceLink && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">🔗 Reference:</span>
                  <a href={wizardInput.referenceLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline truncate">
                    {wizardInput.referenceLink}
                  </a>
                </div>
              )}
              {wizardInput.referenceImage && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Reference Image:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wizardInput.referenceImage} alt="Reference" className="w-32 h-32 rounded-lg border border-slate-200 object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Description</label>
                <textarea
                  className="w-full min-h-[100px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  value={wizardDraft.originalIdea}
                  onChange={(e) => setWizardDraft({ ...wizardDraft, originalIdea: e.target.value })}
                  placeholder="Describe your product idea..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Reference Link (optional)</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  value={wizardDraft.referenceLink}
                  onChange={(e) => setWizardDraft({ ...wizardDraft, referenceLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-2">Reference Image (optional)</label>
                {wizardDraft.referenceImage && (
                  <div className="mb-3 relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={wizardDraft.referenceImage}
                      alt="Reference preview"
                      className="w-32 h-32 rounded-lg border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setWizardDraft({ ...wizardDraft, referenceImage: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Convert to base64 for localStorage storage
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setWizardDraft({ ...wizardDraft, referenceImage: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                <p className="text-xs text-slate-400 mt-1">Upload a reference image (optional)</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelWizardInput}
                  className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveWizardInput}
                  className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === [2.3] AI-GENERATED SUMMARY === */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            🤖 AI-Generated Summary
          </h3>
          {!isEditingSummary && (
            <button
              type="button"
              onClick={() => setIsEditingSummary(true)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {!isEditingSummary ? (
          <p className="text-sm text-slate-700">
            {summary || 'No summary available.'}
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancelSummary}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSummary}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}