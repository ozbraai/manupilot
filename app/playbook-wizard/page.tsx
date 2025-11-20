'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
};

type FormState = Record<string, string>;

type ComponentSuggestion = {
  id: string;
  label: string;
  required?: boolean;
};

type ComponentsInfo = {
  coreProduct: string;
  suggestedComponents: ComponentSuggestion[];
};

type Constraints = {
  targetUnitPrice: string;
  maxUnitPrice: string;
  moq: string;
  launchWindow: string;
  markets: string;
};

export default function PlaybookWizardPage() {
  const router = useRouter();

  // === [1] WIZARD STATE ===
  const [stepIndex, setStepIndex] = useState(0); // 0 = idea, 1 = components, 2 = constraints, 3+ = questions
  const [idea, setIdea] = useState('');
  const [productName, setProductName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<FormState>({});

  const [componentsInfo, setComponentsInfo] = useState<ComponentsInfo | null>(
    null
  );
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const [constraints, setConstraints] = useState<Constraints>({
    targetUnitPrice: '',
    maxUnitPrice: '',
    moq: '',
    launchWindow: '',
    markets: '',
  });

  const [loadingIdea, setLoadingIdea] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === [2] STEP COUNTS ===
  const questionSteps = questions.length;
  const totalSteps = 1 + 1 + 1 + questionSteps; // idea + components + constraints + questions
  const currentStepNumber = stepIndex + 1;
  const progress = totalSteps > 0 ? (currentStepNumber / totalSteps) * 100 : 0;

  const currentQuestionIndex =
    stepIndex >= 3 ? stepIndex - 3 : -1;
  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;

  // === [3] IDEA → LOAD PLAN, COMPONENTS, QUESTIONS ===
  async function handleNextFromIdea() {
    if (!idea.trim()) return;
    setError(null);
    setLoadingIdea(true);

    try {
      // [3.1] Get productName
      const planRes = await fetch('/api/wizard/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const planData = await planRes.json();
      const name =
        (planData.productName as string | undefined)?.trim() ||
        idea.split(/[.!?\n]/)[0].split(' ').slice(0, 5).join(' ');

      setProductName(name);

      // [3.2] Get component suggestions
      setLoadingComponents(true);
      const compRes = await fetch('/api/wizard/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, productName: name }),
      });
      const compData = await compRes.json();

      const components = (compData as ComponentsInfo) || null;
      setComponentsInfo(components);

      // Preselect required component(s) (usually the core product)
      if (components?.suggestedComponents?.length) {
        const defaults = components.suggestedComponents
          .filter((c) => c.required)
          .map((c) => c.id);
        setSelectedComponents(defaults.length ? defaults : []);
      }

      // [3.3] Get deeper AI questions
      setLoadingQuestions(true);
      const qRes = await fetch('/api/wizard/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, productName: name }),
      });
      const qData = await qRes.json();

      if (!qData.questions || !Array.isArray(qData.questions)) {
        throw new Error('AI could not generate tailored questions. Try again.');
      }

      setQuestions(qData.questions);

      // Move to step 1: components
      setStepIndex(1);
    } catch (err: any) {
      console.error('Wizard plan/components/questions error:', err);
      setError(err.message || 'Something went wrong while preparing your wizard.');
    } finally {
      setLoadingIdea(false);
      setLoadingComponents(false);
      setLoadingQuestions(false);
    }
  }

  // === [4] STEP NAVIGATION ===
  function goBack() {
    if (stepIndex === 0) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  async function goNext() {
    setError(null);

    // Step 0 -> Idea handled separately
    if (stepIndex === 0) {
      await handleNextFromIdea();
      return;
    }

    // Step 1 -> Components
    if (stepIndex === 1) {
      setStepIndex(2);
      return;
    }

    // Step 2 -> Constraints
    if (stepIndex === 2) {
      // Optionally validate constraints later
      setStepIndex(3);
      return;
    }

    // Steps 3+ -> AI questions
    if (stepIndex >= 3 && currentQuestionIndex >= 0) {
      const isLastQuestion =
        currentQuestionIndex === questions.length - 1;

      if (isLastQuestion) {
        await submitPlaybook();
      } else {
        setStepIndex((prev) => prev + 1);
      }
    }
  }

  // === [5] ANSWER HANDLERS ===
  function handleAnswerChange(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  }

  function toggleComponentSelection(id: string, required?: boolean) {
    if (required) return; // cannot unselect required core component
    setSelectedComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleConstraintChange(key: keyof Constraints, value: string) {
    setConstraints((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // === [6] FINAL SUBMIT → CALL /api/playbook ===
  async function submitPlaybook() {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          productName,
          questions,
          answers,
          selectedComponents,
          componentsInfo,
          constraints,
        }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('AI returned non-JSON:', text);
        throw new Error('AI returned invalid JSON. Please try again.');
      }

      if (!res.ok || !data.playbook) {
        throw new Error(data.error || 'Failed to generate playbook');
      }

      const playbook = data.playbook;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'manupilotPlaybook',
          JSON.stringify(playbook)
        );
      }

      // Go to summary view; from there user can create project
      router.push('/playbook-summary');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(
        err.message ||
          'Something went wrong while generating your playbook.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // === [7] CURRENT STEP VALUE / DISABLE LOGIC ===
  const currentValue =
    stepIndex === 0
      ? idea
      : stepIndex >= 3 && currentQuestion
      ? answers[currentQuestion.key] || ''
      : stepIndex === 2
      ? Object.values(constraints).join('').trim()
      : 'ok'; // components step is checkbox-based, no text requirement

  const isNextDisabled =
    submitting ||
    loadingIdea ||
    loadingComponents ||
    loadingQuestions ||
    (stepIndex === 0 && !currentValue.trim()) ||
    (stepIndex >= 3 && currentQuestion && !currentValue.trim());

  // === [8] RENDER ===
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
              Answer a few focused questions. We’ll turn your answers into a professional
              manufacturing plan tailored to your product.
            </p>
            {productName && stepIndex > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Working on: <span className="font-medium">{productName}</span>
              </p>
            )}
          </div>

          {/* STEP INFO */}
          {questions.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-500 mt-2">
                Step {currentStepNumber} of {totalSteps}
              </p>
              {(loadingIdea || loadingComponents || loadingQuestions) && (
                <p className="text-xs text-slate-400 mt-1">
                  Thinking about your product…
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

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STEP 0 – IDEA */}
        {stepIndex === 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Describe your idea
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              What are you trying to build?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Provide a short description of your product. We&apos;ll use this to generate
              component suggestions and tailored manufacturing questions.
            </p>
            <textarea
              className="w-full min-h-[160px] resize-vertical rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder="Example: A compact motorised rotisserie kit for camping, compatible with braai grills, with a carry bag and stainless steel forks..."
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
                {loadingIdea || loadingComponents || loadingQuestions
                  ? 'Analysing…'
                  : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* STEP 1 – COMPONENTS */}
        {stepIndex === 1 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Components & extras
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              Which parts should ManuPilot help you develop?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-4">
              We looked at your idea and identified the core product plus possible extras
              (like bags or packaging). Select which ones you want included in this project.
            </p>
            {componentsInfo ? (
              <div className="space-y-3">
                {componentsInfo.suggestedComponents.map((component) => {
                  const checked = selectedComponents.includes(component.id);
                  return (
                    <label
                      key={component.id}
                      className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        checked={checked || component.required}
                        onChange={() =>
                          toggleComponentSelection(
                            component.id,
                            component.required
                          )
                        }
                        disabled={component.required}
                      />
                      <span>
                        {component.label}
                        {component.required && (
                          <span className="ml-2 text-[11px] text-slate-500">
                            (required core product)
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                We couldn&apos;t generate component suggestions yet. You can still continue – the
                AI will infer components later.
              </p>
            )}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 – BUSINESS CONSTRAINTS */}
        {stepIndex === 2 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Business constraints
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              What are your expectations for cost, quantity and timing?
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              This helps ManuPilot give more practical guidance. If you&apos;re unsure, you can
              leave fields blank or give your best guess.
            </p>

            <div className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Target unit price (ex-factory)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: $4.00 per unit"
                    value={constraints.targetUnitPrice}
                    onChange={(e) =>
                      handleConstraintChange('targetUnitPrice', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Maximum unit price you could accept
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: $5.50 per unit"
                    value={constraints.maxUnitPrice}
                    onChange={(e) =>
                      handleConstraintChange('maxUnitPrice', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    MOQ (minimum order quantity) you&apos;re thinking about
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: 500 units"
                    value={constraints.moq}
                    onChange={(e) =>
                      handleConstraintChange('moq', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Target launch timing
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    placeholder="Example: Within 6 months, before Christmas, etc."
                    value={constraints.launchWindow}
                    onChange={(e) =>
                      handleConstraintChange('launchWindow', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Where do you plan to sell?
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  placeholder="Example: South Africa, Australia, US, EU, or global"
                  value={constraints.markets}
                  onChange={(e) =>
                    handleConstraintChange('markets', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* STEP 3+ – AI QUESTIONS */}
        {stepIndex >= 3 && currentQuestion && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              {currentQuestion.label}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              {currentQuestion.helper}
            </p>

            <textarea
              className="w-full min-h-[140px] resize-vertical rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.key] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0 || submitting}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition"
              >
                {currentQuestionIndex === questions.length - 1
                  ? submitting
                    ? 'Generating…'
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