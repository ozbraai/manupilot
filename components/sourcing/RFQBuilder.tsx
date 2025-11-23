'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PartnerCard, { Partner } from '@/components/partners/PartnerCard';

type RFQBuilderProps = {
  projectId: string;
  projectTitle: string;
  sourcingMode: 'white-label' | 'custom';
  bomCount: number;
  targetPrice: string;
  targetMoq: string;
  onSuccess?: () => void;
};

export default function RFQBuilder({
  projectId,
  projectTitle,
  sourcingMode,
  bomCount,
  targetPrice,
  targetMoq,
  onSuccess
}: RFQBuilderProps) {

  // State
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includePackaging, setIncludePackaging] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [matchedPartners, setMatchedPartners] = useState<Partner[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Default questions based on mode
  const [questions, setQuestions] = useState<string[]>(
    sourcingMode === 'white-label'
      ? [
        "What is the extra cost for 2-color logo printing?",
        "Can you provide a die-line template for the packaging?",
        "Is this product currently certified for my target market?"
      ]
      : [
        "Please itemize Tooling Costs (NRE) separately from Unit Price.",
        "What is the estimated mold life (shots) and steel grade?",
        "Do you have in-house injection molding or do you outsource?"
      ]
  );
  const [newQuestion, setNewQuestion] = useState('');

  // Derived
  const isWhiteLabel = sourcingMode === 'white-label';
  const docTitle = isWhiteLabel ? 'Request for Quotation (Private Label)' : 'Request for Quotation (OEM Manufacturing)';

  // Load matched partners on mount
  useEffect(() => {
    async function loadMatches() {
      setLoadingMatches(true);
      try {
        // Check if there's an existing RFQ submission
        const { data: rfq } = await supabase
          .from('rfq_submissions')
          .select('rfq_data')
          .eq('project_id', projectId)
          .single();

        if (rfq?.rfq_data?.matched_partner_ids) {
          // Fetch the full partner details
          const { data: partners } = await supabase
            .from('partners')
            .select('*')
            .in('id', rfq.rfq_data.matched_partner_ids);

          if (partners) {
            setMatchedPartners(partners as Partner[]);
            setSubmitSuccess(true); // Show success view if matches exist
          }
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoadingMatches(false);
      }
    }

    loadMatches();
  }, [projectId]);

  // Handlers
  function addQuestion() {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function handleGenerateRFQ() {
    if (!projectId) {
      alert('Error: Project ID is missing. Please refresh the page.');
      return;
    }

    // Check client-side session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You are not logged in. Please log in to submit an RFQ.');
      return;
    }

    try {
      setIsSubmitting(true);

      const rfqData = {
        projectTitle,
        sourcingMode,
        targetPrice,
        targetMoq,
        includeLogo,
        includePackaging,
        questions,
        generatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/rfq/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          rfqData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RFQ');
      }

      setMatchedPartners(data.matches || []);
      setSubmitSuccess(true);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Error submitting RFQ:', error);
      alert(error.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingMatches) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="animate-spin text-4xl mb-4">↻</div>
        <p className="text-slate-600">Loading RFQ details...</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="space-y-8">
        {/* Success Message */}
        <div className="bg-white border border-green-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">RFQ Package Generated!</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Your Request for Quotation has been securely saved and is ready to be shared with suppliers.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-indigo-600 font-medium hover:underline"
          >
            View RFQ Details
          </button>
        </div>

        {/* Matched Partners */}
        {matchedPartners.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🤝</span>
              <h3 className="text-lg font-bold text-slate-900">Matched Manufacturers</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {matchedPartners.length} Found
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {matchedPartners.map(partner => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  basePath="manufacturers"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">

      {/* LEFT COLUMN: BUILDER */}
      <div className="lg:col-span-2 space-y-8">

        {/* 1. REQUIREMENTS */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="font-semibold text-slate-900">Define Requirements</h3>
          </div>

          <div className="space-y-4 pl-11">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target MOQ</label>
                <input type="text" defaultValue={targetMoq} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Price</label>
                <input type="text" defaultValue={targetPrice} className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50" />
              </div>
            </div>

            {isWhiteLabel ? (
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-sky-800 uppercase">Branding Requirements</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeLogo} onChange={(e) => setIncludeLogo(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Logo printing on product (Silkscreen/Laser)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includePackaging} onChange={(e) => setIncludePackaging(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-slate-700">Custom Color Box (4C Printing)</span>
                </label>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-amber-800 uppercase">Engineering Assets</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-amber-600 rounded opacity-50" />
                  <span className="text-sm text-slate-700">Attach BOM ({bomCount} parts)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-amber-600 rounded" />
                  <span className="text-sm text-slate-700">Attach 3D CAD Files (STEP/IGES)</span>
                </label>
              </div>
            )}
          </div>
        </section>

        {/* 2. VETTING QUESTIONS */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="font-semibold text-slate-900">Supplier Vetting Questions</h3>
          </div>

          <div className="pl-11 space-y-3">
            <p className="text-sm text-slate-500">Customize the technical questions you want every supplier to answer.</p>

            <ul className="space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 group">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">🔹</span>
                    <span>{q}</span>
                  </div>
                  <button onClick={() => removeQuestion(idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add a specific question..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              />
              <button onClick={addQuestion} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium">
                Add
              </button>
            </div>
          </div>
        </section>

        {/* 3. OUTREACH KIT */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">3</div>
            <h3 className="font-semibold">Outreach Kit</h3>
          </div>

          <div className="pl-11 grid md:grid-cols-2 gap-6">
            {/* NDA */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal Protection</p>
              <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                <p className="text-sm font-medium mb-1">Mutual NDA Template</p>
                <p className="text-xs text-slate-400 mb-3">Standard agreement to protect your IP before sharing files.</p>
                <button className="w-full py-1.5 rounded bg-white text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors">
                  Download PDF
                </button>
              </div>
            </div>

            {/* Email Template */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">First Contact Script</p>
              <div className="bg-white/10 rounded-lg p-3 border border-white/10 relative group">
                <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3">
                  "Hi, I am the Purchasing Manager for [Project]. We are looking for a factory to produce {projectTitle}..."
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(`Hi,\n\nI am the Purchasing Manager for a new project based in Australia.\nWe are looking for a factory to produce a ${projectTitle}.\n\nPlease see the attached RFQ for details.\n\nCould you please:\n1. Confirm if you can manufacture this?\n2. Provide a rough EXW quote based on the attached specs?\n\nThanks,\n[Your Name]`)}
                  className="mt-2 w-full py-1.5 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GENERATE BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleGenerateRFQ}
            disabled={isSubmitting}
            className={`bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">↻</span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate RFQ Package</span>
                <span className="text-indigo-200 text-sm font-normal">(PDF)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Document Preview</span>
            <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">DRAFT</span>
          </div>
          <div className="p-6 min-h-[500px] text-[10px] text-slate-600 font-mono bg-slate-50">
            {/* Preview content mirrors state */}
            <div className="border-b border-slate-300 pb-4 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase mb-1">{docTitle}</h2>
              <p>Ref: MP-5483</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800">PROJECT:</p>
                <p>{projectTitle}</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">SPECIFICATIONS:</p>
                <p>- Mode: {isWhiteLabel ? 'Private Label (ODM)' : 'Custom (OEM)'}</p>
                <p>- Target Qty: {targetMoq}</p>
                {isWhiteLabel && includeLogo && <p>- Requirement: Custom Logo Print</p>}
                {isWhiteLabel && includePackaging && <p>- Requirement: Custom Color Box</p>}
              </div>
              <div>
                <p className="font-bold text-slate-800">REQUIRED QUOTATION DETAILS:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>EXW Unit Price (Tiered by Qty)</li>
                  <li>Sample Lead Time & Cost</li>
                  {questions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-300 text-center opacity-50">
              <p>Generated via ManuPilot</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}