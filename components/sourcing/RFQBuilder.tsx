import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PartnerCard, { Partner } from '@/components/partners/PartnerCard';
import { PlaybookV2 } from '@/types/playbook';
import { pdf } from '@react-pdf/renderer';
import RFQDocumentPDF from '@/components/pdf/RFQDocumentPDF';
import { Brain, Download, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

type RFQBuilderProps = {
  projectId: string;
  projectTitle: string;
  sourcingMode: 'white-label' | 'custom';
  bomCount: number;
  targetPrice: string;
  targetMoq: string;
  playbook?: PlaybookV2; // Added playbook prop
  onSuccess?: () => void;
};

type SpecItem = {
  feature: string;
  spec: string;
  tolerance: string;
  criticality: string;
};

// === HELPER: CATEGORY GUIDANCE ===
function getCategoryGuidance(category: string = '', mode: string): string[] {
  const cat = category.toLowerCase();
  const common = [
    "Ask about their defect rate (AQL) policy.",
    "Confirm payment terms for the first order (usually 30% deposit).",
    "Ask if they have experience exporting to your target market."
  ];

  if (cat.includes('clothing') || cat.includes('apparel') || cat.includes('wear')) {
    return [
      "Ask about fabric weight (GSM) and composition tolerance.",
      "Confirm shrinkage rates after washing.",
      "Ask about their pattern-making capability.",
      ...common
    ];
  }
  if (cat.includes('electronic') || cat.includes('device') || cat.includes('gadget')) {
    return [
      "Ask about certifications (FCC, CE, UL) availability.",
      "Confirm battery type and safety reports (MSDS).",
      "Ask about PCB layer count and component sourcing.",
      ...common
    ];
  }
  if (cat.includes('kitchen') || cat.includes('cook') || cat.includes('knife')) {
    return [
      "Ask about food-grade certifications (FDA/LFGB).",
      "Confirm steel hardness (HRC) and heat treatment process.",
      "Ask about dishwasher safety and material durability.",
      ...common
    ];
  }
  if (cat.includes('outdoor') || cat.includes('camp') || cat.includes('sport')) {
    return [
      "Ask about UV resistance and weatherproofing.",
      "Confirm load-bearing capacity and safety tests.",
      "Ask about fabric denier and coating types.",
      ...common
    ];
  }
  if (cat.includes('beauty') || cat.includes('cosmetic')) {
    return [
      "Ask about ingredient lists and stability testing.",
      "Confirm packaging compatibility with the formula.",
      "Ask about filling capacity and lead times.",
      ...common
    ];
  }

  return [
    "Ask about their main production machinery for this item.",
    "Confirm if they do all processes in-house or outsource.",
    "Ask for photos of similar products they have made.",
    ...common
  ];
}

export default function RFQBuilder({
  projectId,
  projectTitle,
  sourcingMode,
  bomCount,
  targetPrice,
  targetMoq,
  playbook,
  onSuccess
}: RFQBuilderProps) {

  // State
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includePackaging, setIncludePackaging] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [matchedPartners, setMatchedPartners] = useState<Partner[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Specs State
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);

  // Message Builder State
  const [messageBody, setMessageBody] = useState('');

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
  const categoryGuidance = getCategoryGuidance(playbook?.category, sourcingMode);
  const rfqRef = `RFQ-${new Date().getFullYear()}-${projectId.substring(0, 4).toUpperCase()}`;

  // Initialize Message Body
  useEffect(() => {
    const specsList = [
      `Product: ${playbook?.coreProduct || projectTitle}`,
      `Category: ${playbook?.category || 'General'}`,
      `Target Qty: ${targetMoq}`,
      `Target Price: ${targetPrice}`,
      playbook?.free?.materials?.length ? `Materials: ${playbook.free.materials.join(', ')}` : '',
    ].filter(Boolean).join('\n- ');

    const initialMsg = `Hi,\n\nI am the Purchasing Manager for a new project. We are looking for a factory to produce a ${playbook?.category || 'product'}: ${projectTitle}.\n\nKey Specifications:\n- ${specsList}\n\nPlease see the attached RFQ for full details.\n\nCould you please:\n1. Confirm if you can manufacture this?\n2. Provide a rough EXW quote based on the attached specs?\n\nThanks,`;

    setMessageBody(initialMsg);
  }, [playbook, projectTitle, targetMoq, targetPrice]);

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

        // Load saved specs if any
        if (rfq?.rfq_data?.specs) {
          setSpecs(rfq.rfq_data.specs);
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

  async function handleGenerateSpecs() {
    setIsGeneratingSpecs(true);
    try {
      const res = await fetch('/api/rfq/generate-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: projectTitle,
          category: playbook?.category,
          description: playbook?.coreProduct || projectTitle
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSpecs(data.specs);
    } catch (error: any) {
      console.error('Error generating specs:', error);
      alert('Failed to generate specs: ' + error.message);
    } finally {
      setIsGeneratingSpecs(false);
    }
  }

  async function handleDownloadPDF() {
    const blob = await pdf(
      <RFQDocumentPDF
        rfqRef={rfqRef}
        date={new Date().toLocaleDateString()}
        projectTitle={projectTitle}
        specs={specs}
        targetMoq={targetMoq}
        targetPrice={targetPrice}
        message={messageBody}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rfqRef}_${projectTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        messageBody, // Include the custom message
        specs, // Include the generated specs
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
        <div className="bg-white border border-green-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">RFQ Package Generated!</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Your Request for Quotation has been securely saved and is ready to be shared with suppliers.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="text-indigo-600 font-medium hover:underline px-6 py-2.5"
            >
              Edit Details
            </button>
          </div>
        </div>

        {/* Matched Partners */}
        {matchedPartners.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🤝</span>
              <h3 className="text-lg font-bold text-slate-900">Matched Manufacturers</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {matchedPartners.length} Found
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {matchedPartners.map(partner => (
                <div key={partner.id} className="relative">
                  <PartnerCard
                    partner={partner}
                    basePath="manufacturers"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quotes & Responses (Placeholder) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💬</span>
            <h3 className="text-lg font-bold text-slate-900">Quotes & Responses</h3>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">MOQ</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {/* Placeholder Row */}
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500 italic" colSpan={5}>
                    No quotes received yet. Suppliers will respond here.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">

      {/* LEFT COLUMN: BUILDER */}
      <div className="lg:col-span-2 space-y-8">

        {/* 0. PRE-RFQ GUIDANCE */}
        <section className="bg-sky-50 border border-sky-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💡</span>
            <h3 className="font-bold text-sky-900">Before you send RFQs</h3>
          </div>
          <p className="text-sm text-sky-800 mb-3">
            Suppliers in the <strong>{playbook?.category || 'manufacturing'}</strong> category expect specific questions. Include these to look like a pro:
          </p>
          <ul className="space-y-2">
            {categoryGuidance.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-sky-900">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 1. TECHNICAL SPECS (NEW) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-semibold text-slate-900">Technical Specifications</h3>
            </div>
            <button
              onClick={handleGenerateSpecs}
              disabled={isGeneratingSpecs}
              className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {isGeneratingSpecs ? (
                <><span className="animate-spin">↻</span> Generating...</>
              ) : (
                <><Sparkles className="w-3 h-3" /> Auto-Fill with AI</>
              )}
            </button>
          </div>

          <div className="pl-11">
            {specs.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2">Feature</th>
                      <th className="px-4 py-2">Specification</th>
                      <th className="px-4 py-2">Tolerance</th>
                      <th className="px-4 py-2">Criticality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specs.map((spec, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-4 py-2 font-medium text-slate-900">{spec.feature}</td>
                        <td className="px-4 py-2 text-slate-600">{spec.spec}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{spec.tolerance}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${spec.criticality.toLowerCase() === 'high' ? 'bg-red-50 text-red-600' :
                            spec.criticality.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                            {spec.criticality}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500 mb-2">No technical specs defined yet.</p>
                <button
                  onClick={handleGenerateSpecs}
                  className="text-indigo-600 text-sm font-bold hover:underline"
                >
                  Generate using AI Co-Pilot
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 2. RFQ SUMMARY & MESSAGE */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="font-semibold text-slate-900">RFQ Summary & Message</h3>
          </div>

          <div className="pl-11 space-y-6">
            {/* Summary Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                {sourcingMode === 'white-label' ? 'White Label' : 'Custom OEM'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                Target: {targetPrice}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                MOQ: {targetMoq}
              </span>
            </div>

            {/* Message Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Message to Suppliers
              </label>
              <div className="relative">
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full h-48 p-4 text-sm text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">
                  You can edit this before sending
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VETTING QUESTIONS */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">3</div>
            <h3 className="font-semibold text-slate-900">Additional Questions</h3>
          </div>

          <div className="pl-11 space-y-3">
            <p className="text-sm text-slate-500">Add specific technical questions you need answered.</p>

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
                <span>Sending RFQs...</span>
              </>
            ) : (
              <>
                <span>Send RFQ Package</span>
                <span className="text-indigo-200 text-sm font-normal">({matchedPartners.length > 0 ? `${matchedPartners.length} matches` : 'Auto-match'})</span>
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
              <p>Ref: {rfqRef}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-800">PROJECT:</p>
                <p>{projectTitle}</p>
              </div>

              {/* Fixed Skeleton Preview */}
              <div className="bg-slate-100 p-2 rounded">
                <p className="font-bold text-slate-800 mb-1">COMMERCIAL TERMS (FIXED):</p>
                <p>- Payment: 30% Deposit / 70% Balance</p>
                <p>- Incoterms: FOB</p>
                <p>- QC: AQL 2.5 Required</p>
              </div>

              {/* Specs Preview */}
              {specs.length > 0 && (
                <div>
                  <p className="font-bold text-slate-800">TECHNICAL SPECS:</p>
                  {specs.map((s, i) => (
                    <p key={i}>- {s.feature}: {s.spec} ({s.tolerance})</p>
                  ))}
                </div>
              )}

              <div>
                <p className="font-bold text-slate-800">MESSAGE:</p>
                <p className="whitespace-pre-wrap border-l-2 border-slate-300 pl-2 italic">
                  {messageBody}
                </p>
              </div>

              <div className="bg-slate-100 p-2 rounded">
                <p className="font-bold text-slate-800 mb-1">REQUIRED PRICE BREAKDOWN:</p>
                <p>[ ] Unit Price (EXW)</p>
                <p>[ ] Packaging Cost</p>
                <p>[ ] FOB Charges</p>
                <p>[ ] Tooling / NRE</p>
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