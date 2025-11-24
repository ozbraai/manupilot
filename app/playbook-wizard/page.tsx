'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// === TYPES ===
type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
  suggestedAnswer?: string;
};

type SubProduct = {
  id: string;
  label: string;
  description?: string;
};

type WhiteLabelSuitability = {
  score: number; // 0 – 1
  reason: string;
  typicalChanges?: string[];
  examples?: string[];
};

type ComponentsInfo = {
  coreProduct: string;
  coreProductSummary?: string;
  category: string;
  keyCharacteristics?: string[];
  subProducts: SubProduct[];
  components: {
    [section: string]: string[];
  };
  supplierTypes: string[];
  whiteLabelSuitability?: WhiteLabelSuitability;
};

type CostEstimate = {
  unitCostRange: string;
  moqRange: string;
  retailRange: string;
  packagingCostRange: string;
  notes: string;
};

type Constraints = {
  maxUnitPrice: string;
  moq: string;
  launchWindow: string;
  markets: string;
};

type Answers = Record<string, string>;

type SourcingMode = 'white-label' | 'custom';

export default function PlaybookWizardPage() {
  const router = useRouter();

  // === [1] WIZARD STATE ===
  const [stepIndex, setStepIndex] = useState(0);

  // Step 0: Mode Selection
  const [sourcingMode, setSourcingMode] = useState<SourcingMode | null>(null);

  // Step 1: Idea
  const [idea, setIdea] = useState('');
  const [productName, setProductName] = useState('');
  const [competitorLink, setCompetitorLink] = useState('');

  // Step 2: Components
  const [componentsInfo, setComponentsInfo] = useState<ComponentsInfo | null>(null);
  const [selectedSubProductIds, setSelectedSubProductIds] = useState<string[]>([]);
  const [includePackaging, setIncludePackaging] = useState(false);
  const [includeInstructions, setIncludeInstructions] = useState(false);

  // White Label Image State
  const [whiteLabelImage, setWhiteLabelImage] = useState<File | null>(null);
  const [whiteLabelImagePreview, setWhiteLabelImagePreview] = useState<string | null>(null);
  const [whiteLabelImageLoading, setWhiteLabelImageLoading] = useState(false);
  const [whiteLabelImageError, setWhiteLabelImageError] = useState<string | null>(null);

  // Step 2
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [constraints, setConstraints] = useState<Constraints>({
    maxUnitPrice: '',
    moq: '',
    launchWindow: '',
    markets: 'US', // Default
  });

  // Launch Goal state (for guided selection)
  const [launchHorizon, setLaunchHorizon] = useState<string>('');
  const [launchDate, setLaunchDate] = useState<string>('');

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});

  // Loading/Submit State
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === ANIMATED MODAL STATE ===
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);

  const generatingSteps = useMemo(
    () => [
      'Analyzing product complexity & DFM risks',
      'Checking regulatory compliance (FCC, CE, etc.)',
      'Calculating BOM estimates and supplier strategy',
      'Structuring phased manufacturing roadmap',
      'Finalizing your tailored playbook',
    ],
    []
  );
  const [activeGeneratingStepIndex, setActiveGeneratingStepIndex] = useState(0);

  useEffect(() => {
    // Show modal for BOTH submitting AND loadingInitial states
    if (!submitting && !loadingInitial) {
      setShowGeneratingModal(false);
      return;
    }

    setShowGeneratingModal(true);
    setActiveGeneratingStepIndex(0);

    const interval = setInterval(() => {
      setActiveGeneratingStepIndex((prev) =>
        (prev + 1) % generatingSteps.length
      );
    }, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [submitting, loadingInitial, generatingSteps]);

  const modalProgressPercent = useMemo(() => {
    if (generatingSteps.length <= 1) return 0;
    return Math.round(
      (activeGeneratingStepIndex / (generatingSteps.length - 1)) * 100
    );
  }, [activeGeneratingStepIndex, generatingSteps.length]);

  // === DERIVED VALUES ===
  const effectiveSourcingMode: SourcingMode = sourcingMode || 'custom';

  const currentQuestionIndex = stepIndex >= 4 ? stepIndex - 4 : -1;
  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;

  const totalSteps = useMemo(() => 4 + questions.length, [questions.length]);
  const displayStepNumber = useMemo(() => stepIndex + 1, [stepIndex]);
  const progressPercent = useMemo(() => {
    if (totalSteps <= 1) return 0;
    const clampedIndex = Math.min(stepIndex, totalSteps - 1);
    return Math.round((clampedIndex / (totalSteps - 1)) * 100);
  }, [stepIndex, totalSteps]);

  const whiteLabelHint = componentsInfo?.whiteLabelSuitability;

  // === NAVIGATION ===
  function goBack() {
    if (stepIndex === 0) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  async function goNext() {
    setError(null);
    if (stepIndex === 0) {
      // Step 0: Mode selection - just move to next step
      setStepIndex(1);
      return;
    }
    if (stepIndex === 1) { await handleNextFromIdea(); return; }
    if (stepIndex === 2) { await handleNextFromComponentsAndSourcing(); return; }
    if (stepIndex === 3) {
      if (questions.length === 0) { await submitPlaybook(); } else { setStepIndex(4); }
      return;
    }
    if (stepIndex >= 4 && currentQuestionIndex >= 0) {
      const isLast = currentQuestionIndex === questions.length - 1;
      if (isLast) { await submitPlaybook(); } else { setStepIndex((prev) => prev + 1); }
    }
  }

  // === HANDLERS ===
  function handleAnswerChange(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  }

  function toggleSubProduct(id: string) {
    setSelectedSubProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleConstraintChange<K extends keyof Constraints>(key: K, value: string) {
    setConstraints((prev) => ({ ...prev, [key]: value }));
  }

  // Sync launchWindow with horizon and date
  useEffect(() => {
    const parts: string[] = [];
    if (launchHorizon) parts.push(launchHorizon);
    if (launchDate) parts.push(launchDate);
    const combined = parts.join(' | ');
    setConstraints((prev) => ({ ...prev, launchWindow: combined }));
  }, [launchHorizon, launchDate]);

  // Helper: Get cost verdict
  function getCostVerdict(): { text: string; color: string } | null {
    if (!constraints.maxUnitPrice || !costEstimate?.unitCostRange) return null;

    // Parse target price (extract first number)
    const targetMatch = constraints.maxUnitPrice.match(/\d+(\.\d+)?/);
    if (!targetMatch) return null;
    const target = parseFloat(targetMatch[0]);

    // Parse cost range (e.g., "$15-25" or "$20-$30")
    const rangeMatch = costEstimate.unitCostRange.match(/\d+(\.\d+)?/g);
    if (!rangeMatch || rangeMatch.length < 2) return null;
    const min = parseFloat(rangeMatch[0]);
    const max = parseFloat(rangeMatch[1]);

    if (target < min) {
      return {
        text: 'Your target cost is lower than typical estimates. Expect negotiation or compromises.',
        color: 'text-amber-700'
      };
    } else if (target >= min && target <= max) {
      return {
        text: 'Your target cost looks realistic for this category.',
        color: 'text-emerald-700'
      };
    } else {
      return {
        text: "You've given yourself some buffer above typical EXW estimates.",
        color: 'text-emerald-700'
      };
    }
  }

  // === API CALLS ===
  async function handleNextFromIdea() {
    if (!idea.trim()) return;
    try {
      setLoadingInitial(true);
      setError(null);

      // 1. Plan
      const planRes = await fetch('/api/wizard/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const planJson = await planRes.json();
      const rawName = planJson.productName || planJson.name || 'Your product';
      setProductName(rawName);

      // 2. Components (Sending competitorLink and sourcingMode now)
      const compRes = await fetch('/api/wizard/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName: rawName,
          competitorLink,
          sourcingMode: effectiveSourcingMode
        }),
      });
      const compJson = await compRes.json();
      setComponentsInfo(compJson || null);
      setSelectedSubProductIds((compJson?.subProducts || []).map((sp: any) => sp.id));

      setStepIndex(2);
    } catch (err: any) {
      console.error('Wizard init error:', err);
      setError(err?.message || 'Something went wrong preparing your wizard.');
    } finally {
      setLoadingInitial(false);
    }
  }

  async function handleNextFromComponentsAndSourcing() {
    if (!componentsInfo) { setStepIndex(3); return; }
    try {
      setLoadingInitial(true);
      setError(null);

      // Parallel fetch: Questions AND Cost Estimate (now that we have sourcing mode)
      const [qRes, costRes] = await Promise.all([
        fetch('/api/wizard/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            productName,
            category: componentsInfo.category,
            coreProduct: componentsInfo.coreProduct,
            components: componentsInfo.components,
            selectedSubProducts: componentsInfo.subProducts,
            sourcingMode: effectiveSourcingMode,
          }),
        }),
        fetch('/api/wizard/cost-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea,
            productName,
            category: componentsInfo.category,
            coreProduct: componentsInfo.coreProduct,
            components: componentsInfo.components,
            sourcingMode: effectiveSourcingMode,
          }),
        })
      ]);

      const qJson = await qRes.json();
      const costJson = await costRes.json();

      // Handle Questions
      const qs: Question[] = Array.isArray(qJson.questions) ? qJson.questions : [];
      setQuestions(qs);
      setAnswers((prev) => {
        const next: Answers = { ...prev };
        qs.forEach((q) => {
          if (q.suggestedAnswer && !next[q.key]) next[q.key] = q.suggestedAnswer;
        });
        return next;
      });

      // Handle Cost Estimate
      setCostEstimate(costJson || null);

      setStepIndex(3);
    } catch (err: any) {
      console.error('Step 2 fetch error:', err);
      setError(err?.message || 'Something went wrong preparing the next step.');
    } finally {
      setLoadingInitial(false);
    }
  }

  // === WHITE LABEL IMAGE LOGIC ===
  async function handleWhiteLabelImageSelected(file: File | null) {
    if (!file) return;
    setWhiteLabelImageError(null);
    setWhiteLabelImage(file);
    setWhiteLabelImagePreview(URL.createObjectURL(file));
    setWhiteLabelImageLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('idea', idea);
      formData.append('productName', productName);
      if (componentsInfo?.category) {
        formData.append('category', componentsInfo.category);
      }

      const res = await fetch('/api/wizard/image-intake', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('AI returned invalid JSON for image intake.');
      }

      if (!res.ok) throw new Error(json.error || 'Failed to analyse reference image.');

      // Update state with AI insights from the image
      if (json.improvedIdea) setIdea(json.improvedIdea);
      if (json.productName) setProductName(json.productName);
      if (json.componentsInfo) {
        setComponentsInfo(json.componentsInfo);
        setSelectedSubProductIds((json.componentsInfo.subProducts || []).map((sp: any) => sp.id));
      }
    } catch (err: any) {
      console.error('White label image error:', err);
      setWhiteLabelImageError(err?.message || 'Could not analyse this image.');
    } finally {
      setWhiteLabelImageLoading(false);
    }
  }

  async function submitPlaybook() {
    try {
      setSubmitting(true);
      setError(null);

      const category = componentsInfo?.category || 'general';
      const coreProduct = componentsInfo?.coreProduct || productName || idea;
      const selectedSubProducts = (componentsInfo?.subProducts || []).filter(
        (sp) => selectedSubProductIds.includes(sp.id)
      );
      const finalSubProducts = [...selectedSubProducts];
      if (includePackaging) finalSubProducts.push({ id: 'packaging', label: 'Packaging' } as any);
      if (includeInstructions) finalSubProducts.push({ id: 'instructions', label: 'Instruction manual' } as any);

      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName,
          category,
          coreProduct,
          componentsInfo,
          selectedSubProducts: finalSubProducts,
          questions,
          answers,
          constraints,
          costEstimate,
          sourcingMode: effectiveSourcingMode,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.playbook) throw new Error(json.error || 'Failed to generate playbook.');

      if (typeof window !== 'undefined') {
        // Save playbook and category to localStorage
        window.localStorage.setItem('manupilotPlaybook', JSON.stringify(json.playbook));
        window.localStorage.setItem('manupilot_temp_category', category);
      }
      router.push('/playbook-summary');
    } catch (err: any) {
      console.error('Playbook submit error:', err);
      setError(err?.message || 'Something went wrong generating the playbook.');
    } finally {
      setSubmitting(false);
    }
  }

  // Validation
  const currentValue: string = (() => {
    if (stepIndex === 0) return sourcingMode || '';
    if (stepIndex === 1) return idea;
    if (stepIndex === 3) return (constraints.moq + constraints.maxUnitPrice + constraints.launchWindow).trim();
    if (stepIndex >= 4 && currentQuestion) return (answers[currentQuestion.key] || '').trim();
    return 'ok';
  })();

  const isNextDisabled = Boolean(
    submitting || loadingInitial ||
    (stepIndex === 0 && !sourcingMode) ||
    (stepIndex === 1 && !idea.trim()) ||
    (stepIndex >= 4 && currentQuestion && !currentValue)
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto pt-16 px-4 md:px-0">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Manufacturing Playbook Wizard</h1>
            <p className="mt-2 text-sm md:text-base text-slate-600">From idea to factory-ready plan.</p>
            {productName && stepIndex > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Working title: <span className="font-medium text-slate-800">{productName}</span>
              </p>
            )}
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>AI co-pilot active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Step {displayStepNumber} of {totalSteps}</span>
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mb-6">
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING BANNER */}
        {loadingInitial && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Thinking...</span>
          </div>
        )}

        {/* === STEP 0: MODE SELECTION === */}
        {stepIndex === 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Choose your path</p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">How do you want to bring this product to life?</h2>
            <p className="text-sm text-slate-600 mb-6">Select the manufacturing approach that best fits your goals.</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* White Label Card */}
              <button
                type="button"
                onClick={() => setSourcingMode('white-label')}
                className={`w-full text-left rounded-xl border-2 px-5 py-6 transition-all ${sourcingMode === 'white-label'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${sourcingMode === 'white-label' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                    {sourcingMode === 'white-label' && (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">White Label</h3>
                    <p className="text-xs text-slate-600 mb-2">Brand an existing factory product with your logo.</p>
                    <p className="text-[11px] text-slate-500">Fastest path to market, based on existing SKUs.</p>
                  </div>
                </div>
              </button>

              {/* Custom Product Card */}
              <button
                type="button"
                onClick={() => setSourcingMode('custom')}
                className={`w-full text-left rounded-xl border-2 px-5 py-6 transition-all ${sourcingMode === 'custom'
                  ? 'border-sky-500 bg-sky-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${sourcingMode === 'custom' ? 'bg-sky-500' : 'bg-slate-200'
                    }`}>
                    {sourcingMode === 'custom' && (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Custom Product</h3>
                    <p className="text-xs text-slate-600 mb-2">Design a unique product with your own specifications.</p>
                    <p className="text-[11px] text-slate-500">More control, customization and IP, but higher up-front cost.</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-6 py-2 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* === STEP 1: IDEA === */}
        {stepIndex === 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              {sourcingMode === 'white-label' ? '2. Product Reference' : '2. Describe your idea'}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              {sourcingMode === 'white-label' ? 'What product do you want to white-label?' : 'What are you trying to build?'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {sourcingMode === 'white-label'
                ? 'Briefly describe what type of product you want to white-label. For example: "A compact portable gas BBQ similar to the Weber Baby Q".'
                : 'Describe your custom product idea in as much detail as possible. Mention the problem it solves, key features, materials, performance expectations, and any inspiration products.'}
            </p>
            <textarea
              className="w-full min-h-[150px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition mb-4"
              placeholder={sourcingMode === 'white-label'
                ? "Example: A compact portable charcoal BBQ similar to the Weber Smokey Joe..."
                : "Example: A compact stainless steel charcoal BBQ with innovative airflow control..."}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />

            {/* Competitor Link */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {sourcingMode === 'white-label' ? 'Reference / Competitor Link' : 'Optional Inspiration Link'}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. https://www.amazon.com/dp/B0..."
                value={competitorLink}
                onChange={(e) => setCompetitorLink(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {sourcingMode === 'white-label'
                  ? 'Paste a link to a product that\'s close to what you want. ManuPilot will analyze it to infer specs and structure.'
                  : 'Paste a link to a similar product for reference (optional).'}
              </p>
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={goBack} className="px-5 py-2 rounded-full border text-xs hover:bg-slate-50 transition">Back</button>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-6 py-2 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50 transition"
              >
                Start Wizard
              </button>
            </div>
          </section>
        )}

        {/* === STEP 2: COMPONENTS & SOURCING === */}
        {stepIndex === 2 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">3. Components & Strategy</p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Structure & Sourcing</h2>

            {componentsInfo ? (
              <div className="space-y-6">
                {/* AI Product Understanding Card */}
                {(componentsInfo.coreProductSummary || componentsInfo.keyCharacteristics) && (
                  <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-4">
                    <p className="text-xs font-semibold text-sky-800 mb-2">AI Product Understanding</p>
                    {componentsInfo.coreProductSummary && (
                      <p className="text-sm text-slate-700 mb-3">{componentsInfo.coreProductSummary}</p>
                    )}
                    {componentsInfo.keyCharacteristics && componentsInfo.keyCharacteristics.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">Key Characteristics:</p>
                        <ul className="text-xs text-slate-700 space-y-0.5 pl-4 list-disc">
                          {componentsInfo.keyCharacteristics.map((char, i) => (
                            <li key={i}>{char}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Core product</p>
                  <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm">{componentsInfo.coreProduct}</div>
                </div>

                {/* Sub Products */}
                {componentsInfo.subProducts?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Sub-products</p>
                    <div className="grid gap-2">
                      {componentsInfo.subProducts.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => toggleSubProduct(sp.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs ${selectedSubProductIds.includes(sp.id) ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Component Breakdown List */}
                {componentsInfo.components && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Component breakdown</p>
                    <div className="grid gap-3 text-xs md:text-sm">
                      {Object.entries(componentsInfo.components).map(
                        ([section, items]) => (
                          <div key={section}>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                              {section === 'core' ? 'Core Product' : section}
                            </p>
                            <ul className="pl-4 list-disc text-slate-700">
                              {items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Supplier Types */}
                {componentsInfo.supplierTypes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Likely supplier types</p>
                    <p className="text-xs text-slate-600">
                      {componentsInfo.supplierTypes.join(' • ')}
                    </p>
                  </div>
                )}

                {/* Packaging Options */}
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={includePackaging} onChange={(e) => setIncludePackaging(e.target.checked)} className="h-3.5 w-3.5 text-sky-600" />
                    <span>Include packaging (boxes, labels)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={includeInstructions} onChange={(e) => setIncludeInstructions(e.target.checked)} className="h-3.5 w-3.5 text-sky-600" />
                    <span>Include instruction manual</span>
                  </label>
                </div>

                {/* Sourcing Mode Display (Read-only) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Manufacturing Approach</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${effectiveSourcingMode === 'white-label'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-sky-800'
                    }`}>
                    {effectiveSourcingMode === 'white-label' ? '🏷️ White Label' : '⚙️ Custom Design'}
                  </div>
                  {whiteLabelHint && (
                    <p className="text-[11px] text-slate-500 mt-2">
                      AI Analysis: This product is {whiteLabelHint.score >= 0.6 ? 'well-suited' : 'moderately suited'} for {effectiveSourcingMode === 'white-label' ? 'white labeling' : 'custom manufacturing'}. {whiteLabelHint.reason}
                    </p>
                  )}
                </div>

                {/* White Label Image Upload */}
                {effectiveSourcingMode === 'white-label' && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Reference Image (Optional)</p>
                    <p className="text-xs text-slate-600 mb-3">Upload a photo of a product close to what you want.</p>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <label className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWhiteLabelImageSelected(e.target.files?.[0] || null)} />
                        Upload Image
                      </label>
                      {whiteLabelImageLoading && <p className="text-[11px] text-slate-500">Analysing...</p>}
                    </div>

                    {whiteLabelImagePreview && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={whiteLabelImagePreview} alt="Reference" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1"><p className="text-[11px] text-slate-600">Image analyzed.</p></div>
                      </div>
                    )}
                    {whiteLabelImageError && <p className="mt-2 text-[11px] text-red-600">{whiteLabelImageError}</p>}

                    {/* AI Interpretation Summary Card */}
                    {componentsInfo && whiteLabelImagePreview && (
                      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-3">
                        <p className="text-[11px] font-semibold text-sky-800 mb-1">
                          Our understanding of this product
                        </p>
                        <p className="text-[11px] text-slate-700 mb-2">
                          Based on your description and the image:
                        </p>
                        <ul className="text-[11px] text-slate-700 space-y-1 pl-4 list-disc">
                          <li>
                            <span className="font-medium">Core product:</span>{' '}
                            {componentsInfo.coreProduct}
                          </li>
                          <li>
                            <span className="font-medium">Category:</span>{' '}
                            {componentsInfo.category}
                          </li>
                          {componentsInfo.components &&
                            Object.keys(componentsInfo.components).length > 0 && (
                              <li>
                                <span className="font-medium">Key components:</span>{' '}
                                {Object.entries(componentsInfo.components)
                                  .slice(0, 2)
                                  .map(([section, items]) => {
                                    const first = items.slice(0, 2).join(', ');
                                    return `${section}: ${first}`;
                                  })
                                  .join(' • ')}
                              </li>
                            )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Loading components...</p>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={goBack} className="px-5 py-2 rounded-full border text-xs">Back</button>
              <button onClick={goNext} className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium">Next</button>
            </div>
          </section>
        )}

        {/* === STEP 3: COMMERCIALS & COMPLIANCE === */}
        {stepIndex === 3 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">4. Commercials & Compliance</p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Success Metrics</h2>

            {/* ManuPilot Estimate Box */}
            {costEstimate && (
              <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
                <p className="font-semibold text-sky-900 mb-3 text-sm">ManuPilot Estimate</p>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-slate-700 mb-3">
                  <div>
                    <p className="text-[11px] text-slate-600 mb-0.5">Unit Cost Range</p>
                    <p className="font-medium text-slate-900">{costEstimate.unitCostRange}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-600 mb-0.5">Normal MOQ Range</p>
                    <p className="font-medium text-slate-900">{costEstimate.moqRange}</p>
                  </div>
                  {costEstimate.packagingCostRange && (
                    <div>
                      <p className="text-[11px] text-slate-600 mb-0.5">Packaging Cost Range</p>
                      <p className="font-medium text-slate-900">{costEstimate.packagingCostRange}</p>
                    </div>
                  )}
                  {costEstimate.retailRange && (
                    <div>
                      <p className="text-[11px] text-slate-600 mb-0.5">Retail Range</p>
                      <p className="font-medium text-slate-900">{costEstimate.retailRange}</p>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 italic border-t border-sky-200 pt-2">
                  These ranges are based on similar products. This is not a formal quote.
                </p>
              </div>
            )}

            {/* Your Targets Section */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Your Targets</p>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Unit Cost</label>
                  <input
                    type="text"
                    value={constraints.maxUnitPrice}
                    onChange={(e) => handleConstraintChange('maxUnitPrice', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder={costEstimate ? `Aiming for ${costEstimate.unitCostRange}` : "e.g. Under $25"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target MOQ</label>
                  <input
                    type="text"
                    value={constraints.moq}
                    onChange={(e) => handleConstraintChange('moq', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder={costEstimate ? `Standard is ${costEstimate.moqRange}` : "e.g. 300-500 units"}
                  />
                </div>
              </div>

              {/* Cost Verdict */}
              {(() => {
                const verdict = getCostVerdict();
                return verdict ? (
                  <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${verdict.color === 'text-emerald-700'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-amber-200 bg-amber-50'
                    }`}>
                    <p className={`font-medium ${verdict.color}`}>{verdict.text}</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Launch Goal with Guided Selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Launch Goal</label>

              {/* Time Horizon Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  'As soon as possible',
                  '1–3 months',
                  '3–6 months',
                  '6–12 months',
                  '12+ months',
                  "I'm not sure yet"
                ].map((horizon) => (
                  <button
                    key={horizon}
                    type="button"
                    onClick={() => setLaunchHorizon(horizon === launchHorizon ? '' : horizon)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${launchHorizon === horizon
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {horizon}
                  </button>
                ))}
              </div>

              {/* Optional Date Picker */}
              <div>
                <label className="block text-xs text-slate-600 mb-1">Optional: Specific launch date</label>
                <input
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            {/* Primary Market */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Primary Market</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {[
                  { value: 'US', label: 'USA' },
                  { value: 'EU', label: 'Europe' },
                  { value: 'AU', label: 'Australia' },
                  { value: 'UK', label: 'UK' },
                  { value: 'GLOBAL', label: 'Global' }
                ].map((market) => (
                  <button
                    key={market.value}
                    type="button"
                    onClick={() => handleConstraintChange('markets', market.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${constraints.markets === market.value
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {market.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                This impacts compliance and certification recommendations later.
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={goBack} className="px-5 py-2 rounded-full border text-xs hover:bg-slate-50 transition">Back</button>
              <button onClick={goNext} className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 transition">
                {questions.length === 0 ? 'Generate Playbook' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* === STEP 4+: QUESTIONS === */}
        {stepIndex >= 4 && currentQuestion && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">5. Deep Dive</p>
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.title}</h2>
            <p className="text-sm text-slate-600 mb-4">{currentQuestion.helper}</p>
            <textarea
              className="w-full min-h-[100px] border rounded-xl p-3 text-sm mb-4"
              value={answers[currentQuestion.key] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
            />
            <div className="flex justify-between">
              <button onClick={goBack} className="px-5 py-2 rounded-full border text-xs">Back</button>
              <button onClick={goNext} className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium">
                {currentQuestionIndex === questions.length - 1 ? 'Generate Playbook' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* === ANIMATED MODAL === */}
        <AnimatePresence>
          {showGeneratingModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sky-100 blur-3xl opacity-70" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-50 blur-2xl opacity-70" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="relative h-9 w-9 rounded-full bg-sky-500/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    >
                      <motion.div
                        className="h-5 w-5 rounded-full bg-sky-500"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                      />
                    </motion.div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Generating</p>
                      <h2 className="text-sm md:text-base font-semibold text-slate-900">Preparing your plan</h2>
                    </div>
                  </div>

                  <ol className="space-y-2 text-sm mb-4">
                    {generatingSteps.map((step, index) => {
                      const isActive = index === activeGeneratingStepIndex;
                      return (
                        <motion.li
                          key={index}
                          className={`flex items-start gap-2 ${isActive ? 'text-sky-600' : 'text-slate-600'}`}
                          initial={false}
                          animate={isActive ? { x: [0, 1.5, 0] } : { x: 0 }}
                          transition={isActive ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : { duration: 0.2 }}
                        >
                          <span className={`mt-1 h-2 w-2 rounded-full ${isActive ? 'bg-sky-500' : 'bg-slate-300'}`} />
                          <span className="text-xs md:text-[13px]">{step}</span>
                        </motion.li>
                      );
                    })}
                  </ol>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      className="h-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${modalProgressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}