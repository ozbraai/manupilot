export default function HowItWorksPage() {
  const steps = [
    {
      id: '01',
      label: 'Capture your idea',
      title: 'Start with what you already know.',
      body: 'Tell ManuPilot what you want to build in plain language — the problem you’re solving, who it’s for, and where you want to manufacture. No engineering degree required.',
      badge: '10–15 minutes',
      icon: '🧠',
    },
    {
      id: '02',
      label: 'Co-pilot builds your spec',
      title: 'Your answers become a factory-ready brief.',
      body: 'Our AI co-pilot turns your answers into structured specifications: dimensions, materials, target costs, risk notes, and compliance flags that factories can actually respond to.',
      badge: 'AI-powered',
      icon: '🤖',
    },
    {
      id: '03',
      label: 'Choose your manufacturing path',
      title: 'Pick the right partners — local or global.',
      body: 'Use the marketplace to find trusted agents, factories and freight partners in Australia, China, Vietnam, India and beyond. Assign your project and keep everything in one place.',
      badge: 'Trusted partners',
      icon: '🌏',
    },
    {
      id: '04',
      label: 'Launch with confidence',
      title: 'Track samples, shipments and economics.',
      body: 'Keep an eye on timelines, costs and quality as you move from samples to production to shipping — with a single source of truth for your entire team.',
      badge: 'End-to-end view',
      icon: '🚢',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py  -20 md:py-24 flex flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
              How it works
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
              From idea to factory-ready in four clear steps.
            </h1>
            <p className="text-base md:text-lg text-slate-600">
              ManuPilot gives you a single guided flow instead of dozens of tabs, inboxes
              and spreadsheets. Here&apos;s what the journey looks like when you start a new
              project.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <a
                href="/register"
                className="inline-flex items-center rounded-full bg-sky-600 text-white px-6 py-3 text-sm font-medium shadow-[0_12px_30px_rgba(56,189,248,0.35)] hover:bg-sky-500 transition"
              >
                Start a project
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-slate-300 text-slate-800 px-6 py-3 text-sm font-medium hover:bg-slate-100 transition"
              >
                View sample dashboard
              </a>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-6 space-y-5">
              <p className="text-sm font-semibold text-slate-700">
                Your project, at a glance
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Project</p>
                    <p className="text-sm font-medium text-slate-900">
                      &ldquo;Outdoor cooking kit – AU + CN&rdquo;
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-1 border border-emerald-100">
                    In spec review
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="text-slate-500 mb-1">Production route</p>
                    <p className="font-medium text-slate-900">AU assembly + CN parts</p>
                    <p className="text-slate-500 mt-1">Lead time est. 8–10 weeks</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="text-slate-500 mb-1">Target landed cost</p>
                    <p className="font-semibold text-slate-900">$38.00 / unit</p>
                    <p className="text-slate-500 mt-1">MOQ 250 units</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3 text-xs">
                  <p className="text-slate-500 mb-1">Co-pilot highlights</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Suggest stainless + hardwood combination to hit weight & cost targets.</li>
                    <li>• Flag food-contact compliance needed for AU/NZ.</li>
                    <li>• Recommend two vetted agents in AU and CN to review.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS GRID */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              What happens after you hit &ldquo;Start a project&rdquo;.
            </h2>
            <p className="text-slate-600">
              ManuPilot doesn&apos;t just give you another form. It walks you through the four
              stages that matter most, with your answers flowing into a spec factories
              can actually use.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-semibold">
                      {step.icon}
                    </div>
                    <span className="mt-2 text-[11px] text-slate-500">{step.id}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                      {step.label}
                    </p>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600">{step.body}</p>
                    <span className="inline-flex mt-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 px-2 py-1">
                      {step.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-16 md:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1.1fr] items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-3">
                Who it&apos;s for
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Built for founders, operators and hands-on makers.
              </h2>
              <p className="text-slate-600">
                Whether you&apos;re launching your first product or reworking an existing supply
                chain, ManuPilot gives you structure without getting in your way.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Early-stage founders
                </p>
                <p className="text-sm text-slate-600">
                  Turn a rough idea into a plan you can show to factories, partners or investors
                  without needing a full product team.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Growing brands
                </p>
                <p className="text-sm text-slate-600">
                  Standardise how you brief factories, compare quotes and track batches across
                  regions and product lines.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Product & ops teams
                </p>
                <p className="text-sm text-slate-600">
                  Give your team one place to see specs, timelines, partners and risk — instead of
                  chasing details in email threads.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Manufacturing partners
                </p>
                <p className="text-sm text-slate-600">
                  Receive clearer briefs, fewer revisions and better-prepared clients — all
                  standardised inside ManuPilot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Start with one project. Let ManuPilot handle the heavy lifting.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Give your next idea a clear path from concept to factory-ready. No more guessing,
            no more endless spreadsheets — just a guided flow and a co-pilot that knows what
            factories need.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center rounded-full bg-sky-600 text-white px-7 py-3 text-sm font-medium hover:bg-sky-500 transition"
            >
              Create a free ManuPilot account
            </a>
            <a
              href="/about"
              className="inline-flex items-center rounded-full border border-slate-300 text-slate-800 px-7 py-3 text-sm font-medium hover:bg-slate-100 transition"
            >
              Learn about our story
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}