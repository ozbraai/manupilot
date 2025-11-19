'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
};

type FormState = Record<string, string>;

export default function PlaybookWizardPage() {
  const router = useRouter();

  // Step tracking
  const [stepIndex, setStepIndex] = useState(0); // 0 = idea, 1..N = questions

  // Wizard state
  const [idea, setIdea] = useState('');
  const [productName, setProductName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<FormState>({});

  // Loading states
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Errors
  const [error, setError] = useState<string | null>(null);

  // Progress bar
  const totalSteps = 1 + (questions.length || 5);
  const currentStepNumber = stepIndex + 1;
  const progress = (currentStepNumber / totalSteps) * 100;

  const currentQuestion: Question | null =
    stepIndex > 0 && questions.length > 0 ? questions[stepIndex - 1] : null;

  // ************************************
  // STEP 0 → ANALYSE IDEA & GENERATE QUESTIONS
  // ************************************
  async function handleNextFromIdea() {
    if (!idea.trim()) return;

    setError(null);
    setLoadingIdea(true);

    try {
      // 1) Generate productName
      const planRes = await fetch('/api/wizard/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      const planData = await planRes.json();
      const name =
        (planData.productName as string)?.trim() ||
        idea.split(/[.!?\n]/)[0].split(' ').slice(0, 5).join(' ');

      setProductName(name);

      // 2) Generate tailored questions
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
      setStepIndex(1);
    } catch (err: any) {
      console.error('Wizard analysis error:', err);
      setError(err.message || 'Something went wrong while generating questions.');
    } finally {
      setLoadingIdea(false);
      setLoadingQuestions(false);
    }
  }

  // ************************************
  // HANDLE QUESTION ANSWER CHANGE
  // ************************************
  function handleAnswerChange(value: string) {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  }

  function goBack() {
    if (stepIndex === 0) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  async function goNext() {
    setError(null);

    // If still answering questions
    if (stepIndex > 0 && stepIndex < questions.length) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    // If at last question
    if (stepIndex === questions.length) {
      await submitPlaybook();
    }
  }

  // ************************************
  // FINAL SUBMIT → GENERATE PLAYBOOK ONLY
  // ************************************
  async function submitPlaybook() {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, productName, questions, answers }),
      });

      const text = await res.text();
      let data: any = null;

      // Try to parse JSON
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('AI returned non-JSON:', text);
        throw new Error('AI returned invalid JSON. Please try again.');
      }

      if (!res.ok || !data.playbook) {
        throw new Error(data.error || 'Failed to generate playbook.');
      }

      const playbook = data.playbook;

      // Save for summary page
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'manupilotPlaybook',
          JSON.stringify(playbook)
        );
      }

      // Redirect to summary
      router.push('/playbook-summary');
    } catch (err: any) {
      console.error('Playbook generation error:', err);
      setError(err.message || 'Something went wrong while generating the playbook.');
    } finally {
      setSubmitting(false);
    }
  }

  const currentValue =
    stepIndex === 0
      ? idea
      : currentQuestion
      ? answers[currentQuestion.key] || ''
      : '';

  const isNextDisabled =
    submitting || loadingIdea || loadingQuestions || !currentValue.trim();

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
              Answer a few focused questions and we'll generate a personalised
              manufacturing plan for your product.
            </p>

            {productName && stepIndex > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Working on: <span className="font-medium">{productName}</span>
              </p>
            )}
          </div>

          {questions.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-500 mt-2">
                Step {currentStepNumber} of {totalSteps}
              </p>
              {(loadingIdea || loadingQuestions) && (
                <p className="text-xs text-slate-400 mt-1">
                  Thinking about your product…
                </p>
              )}
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        {questions.length > 0 && (
          <div className="mb-8">
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

        {/* STEP 0 – IDEA INPUT */}
        {stepIndex === 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Describe your idea
            </p>

            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              What are you trying to build?
            </h2>

            <p className="text-sm md:text-base text-slate-600 mb-6">
              Provide a short description of your product. We'll use it to generate
              tailored questions and a personalised manufacturing plan.
            </p>

            <textarea
              className="w-full min-h-[160px] resize-vertical rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm md:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              placeholder="Example: A lightweight folding camping table made of aluminum that fits into a 4x4 drawer system..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleNextFromIdea}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition"
              >
                {loadingIdea || loadingQuestions ? 'Analysing…' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {/* QUESTION STEPS */}
        {stepIndex > 0 && questions.length > 0 && currentQuestion && (
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
                className="px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
              >
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={isNextDisabled}
                className="px-7 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition"
              >
                {stepIndex === questions.length
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