'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

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
  category: string;
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

type SourcingMode = 'auto' | 'white-label' | 'custom';

export default function PlaybookWizardPage() {
  const router = useRouter();

  // === [1] WIZARD STATE ===
  const [stepIndex, setStepIndex] = useState(0); // 0 = idea, 1 = components/sourcing, 2 = cost/constraints, 3+ = questions

  const [idea, setIdea] = useState('');
  const [productName, setProductName] = useState('');

  const [componentsInfo, setComponentsInfo] = useState<ComponentsInfo | null>(
    null
  );
  const [selectedSubProductIds, setSelectedSubProductIds] = useState<string[]>(
    []
  );
  const [includePackaging, setIncludePackaging] = useState(false);
  const [includeInstructions, setIncludeInstructions] = useState(false);

  const [sourcingMode, setSourcingMode] = useState<SourcingMode>('auto');

  const [whiteLabelImage, setWhiteLabelImage] = useState<File | null>(null);
  const [whiteLabelImagePreview, setWhiteLabelImagePreview] = useState<
    string | null
  >(null);
  const [whiteLabelImageLoading, setWhiteLabelImageLoading] = useState(false);
  const [whiteLabelImageError, setWhiteLabelImageError] = useState<
    string | null
  >(null);

  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});

  const [constraints, setConstraints] = useState<Constraints>({
    maxUnitPrice: '',
    moq: '',
    launchWindow: '',
    markets: '',
  });

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const generatingSteps = useMemo(
    () => [
      'Analysing your idea, goals and constraints',
      'Researching comparable products and benchmarks',
      'Mapping components, sub-products and supplier types',
      'Estimating realistic costs, MOQs and pricing ranges',
      'Building your phased manufacturing roadmap',
    ],
    []
  );
  const [activeGeneratingStepIndex, setActiveGeneratingStepIndex] =
    useState(0);

  useEffect(() => {
    if (!submitting) {
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
  }, [submitting, generatingSteps]);

  const modalProgressPercent = useMemo(() => {
    if (generatingSteps.length <= 1) return 0;
    return Math.round(
      (activeGeneratingStepIndex / (generatingSteps.length - 1)) * 100
    );
  }, [activeGeneratingStepIndex, generatingSteps.length]);

  // Effective sourcing mode (if user leaves it on auto, use AI hint)
  const effectiveSourcingMode: SourcingMode = useMemo(() => {
    if (sourcingMode !== 'auto') return sourcingMode;
    const score = componentsInfo?.whiteLabelSuitability?.score ?? 0;
    if (score >= 0.6) return 'white-label';
    if (score > 0) return 'custom';
    return 'custom';
  }, [sourcingMode, componentsInfo]);

  // === [2] DERIVED VALUES ===
  const currentQuestionIndex = stepIndex >= 3 ? stepIndex - 3 : -1;

  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;

  const totalSteps = useMemo(() => {
    // 0: Idea
    // 1: Components + sourcing
    // 2: Cost & constraints
    // 3+: Questions (dynamic count)
    return 3 + questions.length;
  }, [questions.length]);

  const displayStepNumber = useMemo(() => {
    return stepIndex + 1;
  }, [stepIndex]);

  const progressPercent = useMemo(() => {
    if (totalSteps <= 1) return 0;
    const clampedIndex = Math.min(stepIndex, totalSteps - 1);
    return Math.round((clampedIndex / (totalSteps - 1)) * 100);
  }, [stepIndex, totalSteps]);

  // === [3] NAVIGATION HANDLERS ===
  function goBack() {
    if (stepIndex === 0) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  async function goNext() {
    setError(null);

    if (stepIndex === 0) {
      await handleNextFromIdea();
      return;
    }

    if (stepIndex === 1) {
      await handleNextFromComponentsAndSourcing();
      return;
    }

    if (stepIndex === 2) {
      if (questions.length === 0) {
        await submitPlaybook();
      } else {
        setStepIndex(3);
      }
      return;
    }

    if (stepIndex >= 3 && currentQuestionIndex >= 0) {
      const isLast = currentQuestionIndex === questions.length - 1;
      if (isLast) {
        await submitPlaybook();
      } else {
        setStepIndex((prev) => prev + 1);
      }
    }
  }

  function handleAnswerChange(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  }

  function toggleSubProduct(id: string) {
    setSelectedSubProductIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function handleConstraintChange<K extends keyof Constraints>(
    key: K,
    value: string
  ) {
    setConstraints((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // === [4] STEP 0 -> INITIAL FETCHES ===
  async function handleNextFromIdea() {
    if (!idea.trim()) return;

    try {
      setLoadingInitial(true);
      setError(null);

      // 1) Product name
      const planRes = await fetch('/api/wizard/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      const planText = await planRes.text();
      let productNameJson: any;

      try {
        productNameJson = JSON.parse(planText);
      } catch (e) {
        console.error('Plan JSON parse error:', planText);
        throw new Error('AI returned invalid JSON for product name.');
      }

      const rawName =
        (typeof productNameJson.productName === 'string'
          ? productNameJson.productName
          : productNameJson.name) || 'Your product';

      setProductName(rawName);

      // 2) Components & sub-products
      const compRes = await fetch('/api/wizard/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, productName: rawName }),
      });
      const compText = await compRes.text();
      let compJson: ComponentsInfo;

      try {
        compJson = JSON.parse(compText);
      } catch (e) {
        console.error('Components JSON parse error:', compText);
        throw new Error('AI returned invalid JSON for components.');
      }

      setComponentsInfo(compJson || null);
      setSelectedSubProductIds(
        (compJson?.subProducts || []).map((sp) => sp.id)
      );

      // 3) Cost estimate
      const costRes = await fetch('/api/wizard/cost-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName: rawName,
          category: compJson.category,
          components: compJson.components,
        }),
      });

      const costText = await costRes.text();
      let costJson: CostEstimate;

      try {
        costJson = JSON.parse(costText);
      } catch (e) {
        console.error('Cost JSON parse error:', costText);
        throw new Error('AI returned invalid JSON for cost estimate.');
      }

      setCostEstimate(costJson || null);

      setStepIndex(1);
    } catch (err: any) {
      console.error('Wizard init error:', err);
      setError(
        err?.message || 'Something went wrong preparing your wizard.'
      );
    } finally {
      setLoadingInitial(false);
    }
  }

  // Step 1 -> fetch questions (now that sourcingMode is chosen)
  async function handleNextFromComponentsAndSourcing() {
    if (!componentsInfo) {
      setStepIndex(2);
      return;
    }

    try {
      setLoadingInitial(true);
      setError(null);

      const qRes = await fetch('/api/wizard/questions', {
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
      });

      const qJson = await qRes.json();
      const qs: Question[] = Array.isArray(qJson.questions)
        ? qJson.questions
        : [];

      setQuestions(qs);

      // Pre seed answers with suggestedAnswer where available
      setAnswers((prev) => {
        const next: Answers = { ...prev };
        qs.forEach((q) => {
          if (q.suggestedAnswer && !next[q.key]) {
            next[q.key] = q.suggestedAnswer;
          }
        });
        return next;
      });

      setStepIndex(2);
    } catch (err: any) {
      console.error('Questions fetch error:', err);
      setError(
        err?.message ||
          'Something went wrong preparing your follow up questions.'
      );
    } finally {
      setLoadingInitial(false);
    }
  }

  // === White label image handling ===
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
        console.error('Image intake JSON parse error:', text);
        throw new Error('AI returned invalid JSON for image intake.');
      }

      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyse reference image.');
      }

      if (json.improvedIdea && typeof json.improvedIdea === 'string') {
        setIdea(json.improvedIdea);
      }
      if (json.productName && typeof json.productName === 'string') {
        setProductName(json.productName);
      }
      if (json.componentsInfo) {
        const ci = json.componentsInfo as ComponentsInfo;
        setComponentsInfo(ci);
        setSelectedSubProductIds(
          (ci.subProducts || []).map((sp) => sp.id)
        );
      }
    } catch (err: any) {
      console.error('White label image error:', err);
      setWhiteLabelImageError(
        err?.message ||
          'Could not analyse this image. You can still continue without it.'
      );
    } finally {
      setWhiteLabelImageLoading(false);
    }
  }

  // === [5] FINAL SUBMIT ===
  async function submitPlaybook() {
    try {
      setSubmitting(true);
      setError(null);

      const category = componentsInfo?.category || 'general';
      const coreProduct = componentsInfo?.coreProduct || productName || idea;

      // Selected sub-products from AI list
      const selectedSubProducts = (componentsInfo?.subProducts || []).filter(
        (sp) => selectedSubProductIds.includes(sp.id)
      );

      // Add packaging/instructions
      const finalSubProducts = [...selectedSubProducts];
      if (includePackaging) {
        finalSubProducts.push({
          id: 'packaging',
          label: 'Packaging',
        } as any);
      }
      if (includeInstructions) {
        finalSubProducts.push({
          id: 'instructions',
          label: 'Instruction manual',
        } as any);
      }

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

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error('Playbook JSON parse error:', text);
        throw new Error('AI returned invalid JSON for playbook.');
      }

      if (!res.ok || !json.playbook) {
        throw new Error(
          json.error || 'Failed to generate playbook from AI.'
        );
      }

      const playbook = json.playbook;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'manupilotPlaybook',
          JSON.stringify(playbook)
        );
      }

      router.push('/playbook-summary');
    } catch (err: any) {
      console.error('Playbook submit error:', err);
      setError(
        err?.message || 'Something went wrong generating the playbook.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // === [6] DISABLED LOGIC ===
  const currentValue: string = (() => {
    if (stepIndex === 0) return idea;
    if (stepIndex === 2) {
      return (
        constraints.moq +
        constraints.maxUnitPrice +
        constraints.launchWindow +
        constraints.markets
      ).trim();
    }
    if (stepIndex >= 3 && currentQuestion) {
      return (answers[currentQuestion.key] || '').trim();
    }
    return 'ok';
  })();

  const isNextDisabled: boolean = Boolean(
    submitting ||
      loadingInitial ||
      (stepIndex === 0 && !currentValue) ||
      (stepIndex >= 3 && currentQuestion && !currentValue)
  );

  const whiteLabelHint = componentsInfo?.whiteLabelSuitability;

  // === [7] RENDER ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto pt-16 px-4 md:px-0">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Manufacturing Playbook Wizard
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600">
              Answer a few focused questions. ManuPilot will turn your idea into a
              structured manufacturing plan with components, suppliers, costs, and roadmap.
            </p>
            {productName && stepIndex > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Working title:{' '}
                <span className="font-medium text-slate-800">{productName}</span>
              </p>
            )}
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>AI co-pilot active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Step {displayStepNumber} of {totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
            <span>Wizard progress</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING BANNER FOR INITIAL AI */}
        {loadingInitial && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>
              Thinking about your idea, mapping components, and preparing tailored questions…
            </span>
          </div>
        )}

        {/* STEP 0 – IDEA */}
        {stepIndex === 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              1. Describe your idea
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              What are you trying to build?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Describe your product in as much detail as possible: size, materials, key
              features, optional extras, target customers, and how you imagine it being
              used. The more you share, the smarter ManuPilot can be.
            </p>
            <textarea
              className="w-full min-h-[200px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder="Example: A compact stainless steel charcoal BBQ that folds flat, includes rotisserie mounts, and can be used for both camping and small apartment balconies. Needs to handle 4–6 people and pack into a carry bag."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                ManuPilot will infer product category, components, and supplier types from this.
              </p>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-6 py-2 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50"
              >
                Start Wizard
              </button>
            </div>
          </section>
        )}

        {/* STEP 1 – COMPONENTS, SOURCING MODE & WHITE LABEL IMAGE */}
        {stepIndex === 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              2. Components & sourcing approach
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              How is your product structured and how do you want to source it?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-5">
              ManuPilot has broken your idea into a core product, optional variants, and
              key components. Decide whether you want to white label an existing product
              or create something more custom.
            </p>

            {componentsInfo ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Core product
                  </p>
                  <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800">
                    {componentsInfo.coreProduct}
                  </div>
                </div>

                {componentsInfo.subProducts?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Sub-products and variants
                    </p>
                    <div className="grid gap-2">
                      {componentsInfo.subProducts.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => toggleSubProduct(sp.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs md:text-sm ${
                            selectedSubProductIds.includes(sp.id)
                              ? 'border-sky-500 bg-sky-50 text-sky-800'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-medium">{sp.label}</span>
                          {sp.description && (
                            <span className="block text-[11px] text-slate-500 mt-1">
                              {sp.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={includePackaging}
                      onChange={(e) => setIncludePackaging(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      Include <span className="font-medium">packaging</span> in this playbook
                      (boxes, inserts, labels).
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeInstructions}
                      onChange={(e) => setIncludeInstructions(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      Include <span className="font-medium">instruction manual / inserts</span> as
                      a scoped sub-project.
                    </span>
                  </label>
                </div>

                {componentsInfo.components && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Component breakdown
                    </p>
                    <div className="grid gap-3 text-xs md:text-sm">
                      {Object.entries(componentsInfo.components).map(
                        ([section, items]) => (
                          <div key={section}>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-1">
                              {section}
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

                {componentsInfo.supplierTypes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Likely supplier types to involve
                    </p>
                    <p className="text-xs text-slate-600">
                      {componentsInfo.supplierTypes.join(' • ')}
                    </p>
                  </div>
                )}

                {/* Sourcing approach */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        Sourcing approach
                      </p>
                      <p className="text-xs text-slate-600">
                        Decide whether you want to white label an existing factory product or push
                        towards a more custom design.
                      </p>
                      {whiteLabelHint && (
                        <p className="mt-2 text-[11px] text-slate-500">
                          AI hint:{' '}
                          {whiteLabelHint.score >= 0.6 ? (
                            <>
                              This product category is{' '}
                              <span className="font-semibold">very suitable</span> for white labelling.
                            </>
                          ) : (
                            <>
                              This product can be white labelled, but many brands also customise it.
                            </>
                          )}{' '}
                          {whiteLabelHint.reason && (
                            <span className="block mt-1">{whiteLabelHint.reason}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSourcingMode('white-label')}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-xs ${
                        effectiveSourcingMode === 'white-label'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold mb-1">White label / private label</p>
                      <p className="text-[11px] text-slate-600">
                        Use an existing factory product and put your brand on it. Faster to market,
                        less engineering risk.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourcingMode('custom')}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-xs ${
                        effectiveSourcingMode === 'custom'
                          ? 'border-sky-500 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold mb-1">Custom product / new design</p>
                      <p className="text-[11px] text-slate-600">
                        You want something meaningfully different. ManuPilot will lean into drawings,
                        tooling, prototypes and IP.
                      </p>
                    </button>
                  </div>

                  {sourcingMode === 'auto' && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      If you are not sure, leave this as is. ManuPilot will choose a sensible path
                      based on the product category.
                    </p>
                  )}
                </div>

                {/* White label image upload */}
                {effectiveSourcingMode === 'white-label' && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Reference product image (optional)
                    </p>
                    <p className="text-xs text-slate-600 mb-3">
                      Upload a photo or screenshot of a product that is close to what you want to
                      white label. ManuPilot will use it to refine the description and component
                      structure.
                    </p>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <label className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleWhiteLabelImageSelected(
                              e.target.files?.[0] || null
                            )
                          }
                        />
                        Upload reference image
                      </label>

                      {whiteLabelImageLoading && (
                        <p className="text-[11px] text-slate-500">
                          Analysing image and refining your idea…
                        </p>
                      )}
                    </div>

                    {whiteLabelImagePreview && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={whiteLabelImagePreview}
                            alt="Reference product"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-slate-600">
                            This photo is only used to understand the product better. It is not shared
                            with suppliers.
                          </p>
                        </div>
                      </div>
                    )}

                    {whiteLabelImageError && (
                      <p className="mt-2 text-[11px] text-red-600">
                        {whiteLabelImageError}
                      </p>
                    )}

                    {/* AI interpretation summary */}
                    {componentsInfo && (
                      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-3">
                        <p className="text-[11px] font-semibold text-sky-800 mb-1">
                          Our understanding of this product
                        </p>
                        <p className="text-[11px] text-slate-700 mb-2">
                          Based on your description{' '}
                          {whiteLabelImagePreview ? 'and the image you uploaded ' : ''}
                          ManuPilot believes you are interested in:
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
                          {idea && (
                            <li>
                              <span className="font-medium">Summary:</span> {idea}
                            </li>
                          )}
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
                          {componentsInfo.supplierTypes?.length > 0 && (
                            <li>
                              <span className="font-medium">Likely supplier types:</span>{' '}
                              {componentsInfo.supplierTypes.join(', ')}
                            </li>
                          )}
                        </ul>
                        <p className="mt-2 text-[11px] text-slate-500">
                          If this is roughly right, continue. If not, you can go back and adjust the
                          description before generating your playbook.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                ManuPilot is still preparing component insights from your idea.
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 – COST & CONSTRAINTS */}
        {stepIndex === 2 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              3. Cost expectations & constraints
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              What does “success” look like commercially?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-5">
              ManuPilot will use this to shape your roadmap and highlight trade-offs.
            </p>

            {costEstimate && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs md:text-sm text-slate-700">
                <p className="font-semibold text-slate-800 mb-1">AI rough cost snapshot</p>
                <p>
                  <span className="font-medium">Unit cost:</span> {costEstimate.unitCostRange}
                </p>
                <p>
                  <span className="font-medium">MOQ:</span> {costEstimate.moqRange}
                </p>
                <p>
                  <span className="font-medium">Suggested retail:</span>{' '}
                  {costEstimate.retailRange}
                </p>
                <p>
                  <span className="font-medium">Packaging:</span>{' '}
                  {costEstimate.packagingCostRange}
                </p>
                {costEstimate.notes && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {costEstimate.notes}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Target landed unit cost (approx)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Used to shape feasibility and pricing recommendations.
                  </span>
                </div>
                <input
                  type="text"
                  value={constraints.maxUnitPrice}
                  onChange={(e) =>
                    handleConstraintChange('maxUnitPrice', e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  placeholder="Example: Ideally under $25 landed per unit at MOQ."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    How many units would you be comfortable ordering as a first batch?
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Helps ManuPilot weigh MOQ, tooling cost and risk.
                  </span>
                </div>
                <input
                  type="text"
                  value={constraints.moq}
                  onChange={(e) =>
                    handleConstraintChange('moq', e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  placeholder="Example: 300–500 units for the first production run."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    When would you like to launch?
                  </label>
                  <input
                    type="text"
                    value={constraints.launchWindow}
                    onChange={(e) =>
                      handleConstraintChange('launchWindow', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: Before Black Friday 2025, or in time for summer."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    ManuPilot uses this to suggest realistic timelines and steps.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Where do you want to sell this product?
                  </label>
                  <input
                    type="text"
                    value={constraints.markets}
                    onChange={(e) =>
                      handleConstraintChange('markets', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: Australia and New Zealand first, then US and EU."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    This affects compliance, labelling and logistics assumptions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50"
              >
                {questions.length === 0 ? 'Generate Playbook' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* STEP 3+ – QUESTIONS */}
        {stepIndex >= 3 && currentQuestion && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              4. {currentQuestion.label}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-5">
              {currentQuestion.helper}
            </p>

            <textarea
              className="w-full min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.key] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={submitting || stepIndex === 0}
                className="px-5 py-2 rounded-full border border-slate-300 text-xs text-slate-700 disabled:opacity-40 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-50"
              >
                {currentQuestionIndex === questions.length - 1
                  ? submitting
                    ? 'Generating Playbook…'
                    : 'Generate Playbook'
                  : 'Next'}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* GENERATING MODAL WITH ANIMATIONS */}
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
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: 'easeInOut',
                    }}
                  >
                    <motion.div
                      className="h-5 w-5 rounded-full bg-sky-500"
                      animate={{ y: [0, -2, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Generating your playbook
                    </p>
                    <h2 className="text-sm md:text-base font-semibold text-slate-900">
                      We are preparing your manufacturing plan
                    </h2>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-600 mb-4">
                  ManuPilot is working in the background to turn your answers into an actionable,
                  phased manufacturing playbook.
                </p>

                <ol className="space-y-2 text-sm">
                  {generatingSteps.map((step, index) => {
                    const isActive = index === activeGeneratingStepIndex;
                    return (
                      <motion.li
                        key={index}
                        className={`flex items-start gap-2 ${
                          isActive ? 'text-sky-600' : 'text-slate-600'
                        }`}
                        initial={false}
                        animate={isActive ? { x: [0, 1.5, 0] } : { x: 0 }}
                        transition={
                          isActive
                            ? {
                                repeat: Infinity,
                                duration: 1.2,
                                ease: 'easeInOut',
                              }
                            : { duration: 0.2 }
                        }
                      >
                        <span
                          className={`mt-1 h-2 w-2 rounded-full ${
                            isActive ? 'bg-sky-500' : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-xs md:text-[13px]">{step}</span>
                      </motion.li>
                    );
                  })}
                </ol>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11px] text-slate-500">
                      AI processing
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {modalProgressPercent}%
                    </p>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      className="h-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${modalProgressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-500">
                  This usually takes around 15–25 seconds. You can keep this tab open while we do the heavy lifting.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}