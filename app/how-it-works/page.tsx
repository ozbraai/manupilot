import React from 'react';
import { Brain, Scale, Microscope, Ship, ArrowRight, CheckCircle2, Sparkles, Users } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      id: '01',
      label: 'Define & Validate',
      title: 'Turn your idea into a factory-ready spec.',
      body: 'Don’t start with a blank email. Use our AI Co-pilot to define your product requirements, materials, and target costs. We validate feasibility instantly so you don’t waste time on impossible builds.',
      badge: 'AI Feasibility Analysis',
      icon: <Brain className="w-6 h-6 text-white" />,
      color: 'bg-indigo-600',
    },
    {
      id: '02',
      label: 'Source & Compare',
      title: 'Get quotes you can actually compare.',
      body: 'Send your spec to our network of vetted manufacturers. Our system standardizes every quote so you can compare pricing, MOQs, and lead times side-by-side. No more hidden costs.',
      badge: 'Smart RFQ Management',
      icon: <Scale className="w-6 h-6 text-white" />,
      color: 'bg-indigo-600',
    },
    {
      id: '03',
      label: 'Sample & Quality Control',
      title: 'Catch defects before they ship.',
      body: 'Manage the sampling process digitally. Upload photos of your samples and let our AI Vision analyze them for defects, finish quality, and spec compliance. Approve or request revisions with one click.',
      badge: 'AI Visual Inspection',
      icon: <Microscope className="w-6 h-6 text-white" />,
      color: 'bg-indigo-600',
    },
    {
      id: '04',
      label: 'Production & Logistics',
      title: 'Ship with confidence.',
      body: 'Move from prototype to mass production seamlessly. Track your orders, manage freight partners, and keep all your shipping documents in one secure place.',
      badge: 'End-to-End Tracking',
      icon: <Ship className="w-6 h-6 text-white" />,
      color: 'bg-indigo-600',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-indigo-200/50 blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[60%] rounded-full bg-emerald-200/50 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 flex flex-col gap-12 md:flex-row md:items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>The New Standard</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-slate-900">
              The operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">modern manufacturing</span>.
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
              ManuPilot replaces messy spreadsheets and email chains with a single, intelligent platform. From AI-validated specs to quality-checked shipments.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-8 py-4 text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Start a Project
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center rounded-full bg-white border border-slate-200 text-slate-700 px-8 py-4 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                View Demo Dashboard
              </a>
            </div>
          </div>

          <div className="flex-1 relative">
            {/* Abstract UI Representation */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 p-6 md:p-8 space-y-6 transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Project: AeroPress Go</h3>
                  <p className="text-xs text-slate-500">Status: <span className="text-emerald-600 font-medium">Ready for Production</span></p>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">☕️</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-900 uppercase">AI Insight</p>
                    <p className="text-sm text-indigo-800">Design is feasible. Recommended material: 304 Stainless Steel.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Target Cost</p>
                    <p className="font-bold text-slate-900">$12.50 / unit</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Supplier</p>
                    <p className="font-bold text-slate-900">Shenzhen Mfg.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Sample T2 Approved</span>
                  <span className="mx-2">•</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>QC Passed</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-slate-100 rounded-2xl border border-slate-200 transform rotate-6 opacity-50"></div>
          </div>
        </div>
      </section>

      {/* STEPS GRID */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              From back-of-napkin to <br className="hidden md:block" />
              bill-of-lading in four steps.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We've codified the manufacturing process into a streamlined workflow.
              No more guessing what comes next. ManuPilot guides you through every critical milestone.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl ${step.color} shadow-lg shadow-indigo-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-300 font-mono">{step.id}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
                        {step.label}
                      </p>
                      <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 px-2 py-0.5">
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] items-start">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                Who it's for
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Built for builders,<br /> not bureaucrats.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Whether you're a solo founder or a scaling operations team, ManuPilot gives you the tools to move fast without breaking things.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-800 transition-colors">
                <div className="bg-indigo-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Founders</h3>
                <p className="text-sm text-slate-400">
                  Validate your idea and get to production without hiring a sourcing agent.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-800 transition-colors">
                <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Scaling Brands</h3>
                <p className="text-sm text-slate-400">
                  Standardize your supply chain and manage multiple SKUs in one place.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-800 transition-colors">
                <div className="bg-amber-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Product Teams</h3>
                <p className="text-sm text-slate-400">
                  Collaborate on specs and QC without endless email threads.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-800 transition-colors">
                <div className="bg-purple-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Innovators</h3>
                <p className="text-sm text-slate-400">
                  Push boundaries with materials and designs, backed by AI feasibility checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Ready to build something real?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join hundreds of founders using ManuPilot to bring their products to life.
            Start your first project today—it takes less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 text-white px-8 py-4 text-base font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Your Free Project
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700 px-8 py-4 text-base font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              Read Our Manifesto
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}