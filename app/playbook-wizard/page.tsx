'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
};

type SubProduct = {
  id: string;
  label: string;
  typicallyIncluded: boolean;
  description?: string;
};

type ComponentsInfo = {
  coreProduct: string;
  category: string;
  subProducts: SubProduct[];
  components: Record<string, string[]>;
  supplierTypes: string[];
};

type CostEstimate = {
  unitCostRange: string;
  moqRange: string;
  retailRange: string;
  packagingCostRange: string;
  notes: string;
};

type Constraints = {
  targetUnitPrice: string;
  maxUnitPrice: string;
  moq: string;
  launchWindow: string;
  markets: string;
};

type Answers = Record<string, string>;

export default function PlaybookWizardPage() {
  const router = useRouter();

  // === [1] WIZARD STATE ===
  const [stepIndex, setStepIndex] = useState(0); // 0 = idea, 1 = components/subs, 2 = cost/constraints, 3+ = questions

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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});

  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [constraints, setConstraints] = useState<Constraints>({
    targetUnitPrice: '',
    maxUnitPrice: '',
    moq: '',
    launchWindow: '',
    markets: '',
  });

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === [2] DERIVED VALUES ===
  const currentQuestionIndex =
    stepIndex >= 3 ? stepIndex - 3 : -1;

  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;

  const totalSteps = useMemo(() => {
    // Step0 = idea, Step1 = components, Step2 = cost/constraints, then questions
    return 3 + questions.length;
  }, [questions.length]);

  const currentStepNumber = stepIndex + 1;
  const progress =
    totalSteps > 0
      ? Math.round((currentStepNumber / totalSteps) * 100)
      : 0;

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
      setStepIndex(2);
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
        ? prev.filter((p) => p !== id)
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

      // PLAN
      const planRes = await fetch('/api/wizard/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const planJson = await planRes.json();
      const rawName: string =
        (planJson.productName as string | undefined)?.trim() ||
        idea.split(/[.!?\n]/)[0].split(' ').slice(0, 6).join(' ');
      setProductName(rawName);

      // COMPONENTS
      const compRes = await fetch('/api/wizard/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, productName: rawName }),
      });
      const compJson = (await compRes.json()) as ComponentsInfo;

      // Safe structure
      compJson.components = compJson.components || {};
      if (!Array.isArray(compJson.components.core)) {
        compJson.components.core = [];
      }
      compJson.subProducts = compJson.subProducts || [];
      compJson.supplierTypes = compJson.supplierTypes || [];

      setComponentsInfo(compJson);
      setSelectedSubProductIds([]);

      // COST ESTIMATE
      const costRes = await fetch('/api/wizard/cost-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName: rawName,
          category: compJson.category,
          coreProduct: compJson.coreProduct,
        }),
      });
      const costJson = (await costRes.json()) as CostEstimate;
      setCostEstimate(costJson);

      // QUESTIONS
      const qRes = await fetch('/api/wizard/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName: rawName,
          category: compJson.category,
          coreProduct: compJson.coreProduct,
          components: compJson.components,
          selectedSubProducts: compJson.subProducts,
        }),
      });
      const qJson = await qRes.json();
      const qs: Question[] = Array.isArray(qJson.questions)
        ? qJson.questions
        : [];
      setQuestions(qs);

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
        constraints.targetUnitPrice +
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
                Working on: <span className="font-medium">{productName}</span>
              </p>
            )}
          </div>
          {totalSteps > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-500 mt-2">
                Step {stepIndex + 1} of {totalSteps}
              </p>
              {(loadingInitial || submitting) && (
                <p className="text-xs text-slate-400 mt-1">
                  Letting ManuPilot think…
                </p>
              )}
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        {totalSteps > 1 && (
          <div className="mb-6">
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-1.5 bg-sky-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
              className="w-full min-h-[160px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder="Example: A compact motorised rotisserie that mounts on a camp braai, made from stainless steel with adjustable forks, runs on rechargeable batteries, and comes with optional carry cover..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition"
              >
                {loadingInitial ? 'Analysing…' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* STEP 1 – COMPONENTS & SUB-PRODUCTS */}
        {stepIndex === 1 && componentsInfo && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                2. Components & sub-products
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                What parts should ManuPilot help you develop?
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                We analysed your idea and identified the core product plus logical extras.
                Select which additional items you want to include in this playbook.
              </p>
            </div>

            {/* Core product */}
            {componentsInfo && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                  Core product
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {componentsInfo.coreProduct}
                </p>
                {Array.isArray(componentsInfo.components?.core) &&
                  componentsInfo.components.core.length > 0 && (
                    <p className="mt-1 text-xs text-slate-600">
                      Components:{' '}
                      {componentsInfo.components.core.join(', ')}
                    </p>
                  )}
              </div>
            )}

            {/* AI-detected sub-products */}
            {componentsInfo.subProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  AI-detected sub-products
                </p>
                <div className="space-y-2">
                  {componentsInfo.subProducts.map((sp) => {
                    const subComps =
                      componentsInfo.components?.[sp.id] || [];
                    return (
                      <label
                        key={sp.id}
                        className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          checked={selectedSubProductIds.includes(sp.id)}
                          onChange={() => toggleSubProduct(sp.id)}
                        />
                        <div>
                          <p className="font-medium">{sp.label}</p>
                          {sp.description && (
                            <p className="text-xs text-slate-500">
                              {sp.description}
                            </p>
                          )}
                          {subComps.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              Components: {subComps.join(', ')}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Essentials */}
            <div className="pt-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Essentials
              </p>
              <p className="text-xs text-slate-600 pb-1">
                Almost every product needs packaging and a basic instruction manual. Tick
                any you want ManuPilot to help you develop.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    checked={includePackaging}
                    onChange={(e) => setIncludePackaging(e.target.checked)}
                  />
                  <span>Packaging</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    checked={includeInstructions}
                    onChange={(e) =>
                      setIncludeInstructions(e.target.checked)
                    }
                  />
                  <span>Instruction manual</span>
                </label>
              </div>
            </div>

            {/* Supplier types */}
            {componentsInfo.supplierTypes?.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                  Likely supplier types
                </p>
                <p className="text-xs text-slate-600">
                  ManuPilot expects you may need factories in these categories:{' '}
                  <span className="font-medium">
                    {componentsInfo.supplierTypes.join(', ')}
                  </span>
                </p>
              </div>
            )}

            {/* Nav */}
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
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 – COST & CONSTRAINTS */}
        {stepIndex === 2 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                3. Cost expectations & constraints
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                What are your expectations around cost, MOQ, and timing?
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                These numbers don&apos;t need to be perfect. They help ManuPilot give more
                practical guidance around feasibility and next steps.
              </p>
            </div>
                        {costEstimate && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">
                  AI rough estimate (not a quote):
                </p>
                {costEstimate.unitCostRange && (
                  <p>
                    <span className="font-medium">Unit cost:</span>{' '}
                    {costEstimate.unitCostRange}
                  </p>
                )}
                {costEstimate.moqRange && (
                  <p>
                    <span className="font-medium">MOQ:</span>{' '}
                    {costEstimate.moqRange}
                  </p>
                )}
                {costEstimate.retailRange && (
                  <p>
                    <span className="font-medium">Retail pricing:</span>{' '}
                    {costEstimate.retailRange}
                  </p>
                )}
                {costEstimate.packagingCostRange && (
                  <p>
                    <span className="font-medium">Packaging:</span>{' '}
                    {costEstimate.packagingCostRange}
                  </p>
                )}
                {costEstimate.notes && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {costEstimate.notes}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Target unit cost (ex-factory)
                </label>
                <input
                  type="text"
                  value={constraints.targetUnitPrice}
                  onChange={(e) =>
                    handleConstraintChange('targetUnitPrice', e.target.value)
                  }
                  placeholder="Example: $12.00 per unit"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  This is what you hope to pay the factory (before shipping, duties, etc.).
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Maximum acceptable unit cost
                </label>
                <input
                  type="text"
                  value={constraints.maxUnitPrice}
                  onChange={(e) =>
                    handleConstraintChange('maxUnitPrice', e.target.value)
                  }
                  placeholder="Example: $15.00 per unit"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  The highest you could realistically accept before the product stops making sense.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  MOQ you&apos;re aiming for
                </label>
                <input
                  type="text"
                  value={constraints.moq}
                  onChange={(e) =>
                    handleConstraintChange('moq', e.target.value)
                  }
                  placeholder="Example: 300 units"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  If unsure, describe the range you&apos;re comfortable with, e.g. 200–500 units.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  When do you need first production?
                </label>
                <input
                  type="text"
                  value={constraints.launchWindow}
                  onChange={(e) =>
                    handleConstraintChange('launchWindow', e.target.value)
                  }
                  placeholder="Example: Before Christmas 2025 / Within 6–9 months"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  ManuPilot uses this to suggest realistic timelines and steps.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <label className="block text-xs font-semibold text-slate-600">
                Where do you want to sell this product?
              </label>
              <input
                type="text"
                value={constraints.markets}
                onChange={(e) =>
                  handleConstraintChange('markets', e.target.value)
                }
                placeholder="Example: Australia and New Zealand first, then US and EU"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                This impacts potential compliance requirements and shipping considerations.
              </p>
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
                disabled={submitting}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-60"
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
              className="w-full min-h-[140px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
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
    </main>
  );
}