'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ChatWidget from '@/components/ChatWidget';
import RegisterModal from '@/components/RegisterModal';

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
    // keep as-is or extend later
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
      <main className="min-h-screen bg-white text-zinc-900">
        {/* HERO */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
          {/* Background Gradients */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white opacity-70" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-50/40 blur-[100px] rounded-full mix-blend-multiply -z-10" />
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-sky-50/40 blur-[100px] rounded-full mix-blend-multiply -z-10" />

          <div className="relative max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] items-center">
              {/* HERO TEXT */}
              <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  AI-Powered Manufacturing
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-zinc-900 text-balance">
                  Turn product ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">factory-ready reality.</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-600 leading-relaxed text-balance max-w-xl">
                  Your AI co-pilot for sourcing. Describe your concept, and ManuPilot guides you through NDAs, specifications, and supplier-ready briefs—without the chaos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleStartProject}
                    className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-zinc-900 text-white font-semibold text-base shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/30 transition-all transform hover:-translate-y-0.5"
                  >
                    Start your first project
                  </button>

                  <button
                    onClick={handleGetPlaybook}
                    className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-white border border-zinc-200 text-zinc-700 font-medium text-base hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                  >
                    Get free Playbook
                  </button>
                </div>

                <div className="grid gap-6 pt-8 border-t border-zinc-100 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-600 text-xs">🔒</span>
                      NDA Protected
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">Your IP stays safe with automatic NDAs for every project.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs">🤖</span>
                      AI Co-Pilot
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">Smart assistant fills in technical gaps in your specs.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs">📄</span>
                      Factory Ready
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">Generate professional briefs suppliers actually understand.</p>
                  </div>
                </div>
              </div>

              {/* Right side illustration */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                <div className="relative w-full max-w-lg aspect-[4/5] md:aspect-square lg:aspect-auto h-full max-h-[500px] rounded-3xl bg-white border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Window Controls */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-50 border-b border-zinc-100 flex items-center px-4 gap-2 z-10">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  </div>

                  {/* Content Mockup */}
                  <div className="absolute inset-0 pt-10 bg-zinc-50/50 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Project</div>
                        <div className="text-lg font-bold text-zinc-900">Ergonomic Coffee Press</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
                        Ready for Sourcing
                      </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-hidden relative">
                      {/* Spec Card 1 */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">Material Specs</div>
                            <div className="text-xs text-zinc-500 mt-1">Borosilicate Glass (Heat resistant), 304 Stainless Steel Mesh</div>
                          </div>
                        </div>
                      </div>

                      {/* Spec Card 2 */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-900">Dimensions</div>
                            <div className="text-xs text-zinc-500 mt-1">Height: 22cm, Diameter: 10cm, Capacity: 1000ml</div>
                          </div>
                        </div>
                      </div>

                      {/* AI Chat Bubble */}
                      <div className="absolute bottom-4 right-0 left-4 bg-zinc-900 text-white p-4 rounded-2xl rounded-tl-none shadow-xl text-sm leading-relaxed">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          ManuPilot AI
                        </div>
                        "I've updated the target price based on the new stainless steel grade. We should aim for $8.50 - $9.20 per unit at 500 MOQ."
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-8 top-1/4 bg-white p-3 rounded-xl shadow-lg border border-zinc-100 animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏭</span>
                    <div className="text-xs font-bold text-zinc-800">5 Verified Suppliers</div>
                  </div>
                </div>
                <div className="absolute -left-4 bottom-1/4 bg-white p-3 rounded-xl shadow-lg border border-zinc-100 animate-pulse duration-[4000ms]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📉</span>
                    <div className="text-xs font-bold text-zinc-800">Cost Optimized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="relative z-10 bg-zinc-50 border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:px-8">
            <FadeInSection className="space-y-16">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
                  From fuzzy idea to factory-ready.
                </h2>
                <p className="text-lg text-zinc-600">
                  Three guided steps to professional manufacturing specs. No spreadsheets, no chaos.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">1</div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    Describe your idea
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    Start a project and answer simple questions about what you&apos;re building. Who is it for? How should it feel?
                  </p>
                </div>

                <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">2</div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    AI Refinement
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    ManuPilot turns your answers into structured specs: dimensions, materials, tolerances, and target costs.
                  </p>
                </div>

                <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">3</div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    Export & Source
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    Download a clean, professional brief or send it straight to our vetted sourcing partners in one click.
                  </p>
                </div>
              </div>
            </FadeInSection>
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