'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ChatWidget from '@/components/ChatWidget';
import RegisterModal from '@/components/RegisterModal';
import { ArrowRight, Brain, Scale, Microscope, LayoutDashboard, Sparkles, CheckCircle2, Zap } from 'lucide-react';

function FadeInSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }
    loadUser();
  }, []);

  async function handleStartProject() {
    router.push('/dashboard');
  }

  async function handleGetPlaybook() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/playbook-wizard');
    } else {
      setShowRegisterModal(true);
    }
  }

  function handleRegisterSuccess(email: string | null) {
    setUserEmail(email);
    setShowRegisterModal(false);
    router.push('/playbook-wizard');
  }

  return (
    <>
      <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {/* HERO */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-indigo-100/60 blur-3xl opacity-60"></div>
            <div className="absolute top-[40%] -left-[10%] w-[40%] h-[60%] rounded-full bg-emerald-100/60 blur-3xl opacity-60"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] items-center">
              {/* HERO TEXT */}
              <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  AI-Powered Manufacturing OS
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
                  The operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">modern brands.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                  Turn product ideas into factory-ready reality. ManuPilot guides you through AI-validated specs, smart RFQs, and automated quality control—all in one place.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleStartProject}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-slate-900 text-white font-bold text-base shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Start Your Project
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleGetPlaybook}
                    className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  >
                    Get Free Playbook
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-8 border-t border-slate-100 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              {/* Right side illustration */}
              <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
                <div className="relative w-full max-w-lg aspect-[4/5] md:aspect-square lg:aspect-auto h-full max-h-[550px] rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700 ease-out">
                  {/* Window Controls */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-slate-50 border-b border-slate-100 flex items-center px-5 gap-2 z-10">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  </div>

                  {/* Dashboard Mockup Content */}
                  <div className="absolute inset-0 pt-12 bg-slate-50/50 p-6 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Project Dashboard</h3>
                        <p className="text-xs text-slate-500">Overview for "Aeropress Go"</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        AG
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Feasibility</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900">98% Match</div>
                        <div className="text-xs text-emerald-600 mt-1">Ready for tooling</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Best Quote</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900">$8.50/unit</div>
                        <div className="text-xs text-slate-400 mt-1">Shenzhen Mfg.</div>
                      </div>
                    </div>

                    {/* Active Task */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Recent Activity</span>
                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">Live</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Microscope className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Sample T1 Analyzed</p>
                            <p className="text-xs text-slate-500">AI detected 0 critical defects. Surface finish matches spec.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Spec Optimized</p>
                            <p className="text-xs text-slate-500">Material changed to 304SS for better durability.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Floating Badge */}
                    <div className="absolute bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs font-bold">System Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Everything you need to build physical products.
              </h2>
              <p className="text-lg text-slate-600">
                Stop juggling spreadsheets and emails. ManuPilot unifies your entire supply chain workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Feasibility</h3>
                <p className="text-sm text-slate-600">
                  Validate your product concept instantly. Our AI checks for manufacturing risks before you even talk to a factory.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Smart RFQs</h3>
                <p className="text-sm text-slate-600">
                  Get standardized quotes from vetted suppliers. Compare pricing, MOQs, and lead times side-by-side.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Microscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Visual QC</h3>
                <p className="text-sm text-slate-600">
                  Upload sample photos and let our AI Vision detect defects, scratches, and finish inconsistencies automatically.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Unified Dashboard</h3>
                <p className="text-sm text-slate-600">
                  One source of truth for your team. Track projects, orders, and shipments in a single, secure workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS TEASER */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <FadeInSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    A guided path from <br />
                    <span className="text-indigo-600">concept</span> to <span className="text-emerald-600">container</span>.
                  </h2>
                  <p className="text-lg text-slate-600">
                    We've codified the manufacturing process into a streamlined workflow. No more guessing what comes next.
                  </p>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-slate-900">Define & Validate</h4>
                        <p className="text-sm text-slate-600">Use AI to build a factory-ready spec.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-slate-900">Source & Compare</h4>
                        <p className="text-sm text-slate-600">Get quotes from trusted partners.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-bold text-slate-900">Sample & Ship</h4>
                        <p className="text-sm text-slate-600">Verify quality and manage logistics.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => router.push('/how-it-works')}
                      className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center gap-2"
                    >
                      See how it works <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-emerald-100 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workflow</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-slate-700 line-through">Draft Product Spec</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-slate-700 line-through">Feasibility Check</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                        <span className="font-bold text-indigo-900">Reviewing Supplier Quotes</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 opacity-50">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                        <span className="font-medium text-slate-500">Order Samples</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to build?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join the new wave of hardware founders. Start your project today and get your first feasibility report in minutes.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleStartProject}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200"
              >
                Launch Your Project
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ManuBot chat widget */}
      <ChatWidget />

      {/* Register modal specifically for home CTA when user not logged in */}
      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onAuthSuccess={handleRegisterSuccess}
      />
    </>
  );
}