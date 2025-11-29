import React from 'react';
import {
  ArrowRight,
  Globe2,
  ShieldCheck,
  Zap,
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 md:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500/20 blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Globe2 className="w-3 h-3" />
              <span>Our Mission</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-8">
              We're building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">operating system</span> for the physical world.
            </h1>

            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl">
              ManuPilot was born from the frustration of lost containers, confused factories, and endless spreadsheets. We believe that bringing a product to life should be as seamless as writing code.
            </p>
          </div>
        </div>
      </section>

      {/* CHAOS VS ORDER */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Manufacturing is broken. <br />We're fixing it.
            </h2>
            <p className="text-lg text-slate-600">
              The old way relies on fragmented tools and opaque relationships. ManuPilot brings everything into one unified, intelligent workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">The Old Way</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>Endless email threads and WeChat messages</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>Spreadsheets that are always out of date</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>Hidden fees and surprise delays</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>Zero visibility into quality control</span>
                </li>
              </ul>
            </div>

            {/* The ManuPilot Way */}
            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-bl-full -mr-10 -mt-10"></div>

              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">The ManuPilot Way</h3>
              </div>
              <ul className="space-y-4 relative">
                <li className="flex items-start gap-3 text-slate-700 font-medium">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Centralized communication & documentation</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 font-medium">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Real-time tracking from factory to door</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 font-medium">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>AI-verified specs and transparent pricing</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 font-medium">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Automated visual quality inspection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Our DNA</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              Principles we build by.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <ShieldCheck className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Radical Transparency</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No black boxes. We believe you should know exactly who is making your product, what it costs, and where it is at all times.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <Sparkles className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">AI with a Human Touch</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We use AI to automate the tedious parts of manufacturing, but we know that real relationships build great products.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                <Zap className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Speed as a Feature</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                In hardware, time is money. Our platform is designed to shave weeks off your development and production cycles.
              </p>
            </div>

            <div className="group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                <Target className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Quality is Non-Negotiable</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We don't cut corners. Our rigorous vetting and QC processes ensure that what you design is what you get.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-6">
                <Users className="w-3 h-3" />
                <span>Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Built by makers, for makers.
              </h2>
              <div className="space-y-6 text-lg text-slate-600">
                <p>
                  We didn't start as a software company. We started as product founders, shipping everything from consumer electronics to home goods.
                </p>
                <p>
                  After years of late-night calls with factories, dealing with quality fades, and managing complex logistics on spreadsheets, we realized something: <strong className="text-slate-900">The tools we needed didn't exist.</strong>
                </p>
                <p>
                  So we built ManuPilot. It's the platform we wished we had when we shipped our first container.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
                <div>
                  <div className="text-3xl font-bold text-slate-900">10+</div>
                  <div className="text-sm text-slate-500 mt-1">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">250k+</div>
                  <div className="text-sm text-slate-500 mt-1">Products Shipped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">20+</div>
                  <div className="text-sm text-slate-500 mt-1">Countries Served</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                    </div>
                    <div className="pb-8">
                      <span className="text-xs font-bold text-slate-400 uppercase">2015 - 2019</span>
                      <h4 className="text-lg font-bold text-slate-900">The Learning Curve</h4>
                      <p className="text-slate-600 text-sm mt-2">
                        We launched our first brands. Learned the hard way about MOQ negotiation, QC failures, and freight forwarding.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                    </div>
                    <div className="pb-8">
                      <span className="text-xs font-bold text-slate-400 uppercase">2020 - 2023</span>
                      <h4 className="text-lg font-bold text-slate-900">Internal Tools</h4>
                      <p className="text-slate-600 text-sm mt-2">
                        Built internal software to manage our own supply chains. Efficiency skyrocketed. Other founders started asking to use it.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase">2024 - Today</span>
                      <h4 className="text-lg font-bold text-slate-900">ManuPilot Launches</h4>
                      <p className="text-slate-600 text-sm mt-2">
                        We opened our platform to the world, combining our manufacturing network with AI to help everyone build better hardware.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to build something real?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Join the new wave of hardware founders. Start your project today and get your first feasibility report in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-white/10 border border-white/10 text-white font-bold text-base hover:bg-white/20 transition-all duration-200"
            >
              View Demo Dashboard
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}