import ChatWidget from '@/components/ChatWidget';
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

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
      className={`transform transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  // check if user is logged in for navbar
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  async function handleQuickTestProject() {
    setCreating(true);
    setCreateMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreateMessage('You need to log in first.');
      setCreating(false);
      return;
    }

    const { error } = await supabase.from('projects').insert({
      title: 'Quick ManuPilot test project',
      description: 'Created from the homepage button',
      user_id: user.id,
    });

    if (error) {
      setCreateMessage('Something went wrong saving to Supabase.');
    } else {
      setCreateMessage('Project saved to Supabase successfully.');
    }

    setCreating(false);
  }

  function handleAuthSuccess(email: string | null) {
    setUserEmail(email);
    // after login/registration, take them to dashboard
    router.push('/dashboard');
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {/* STICKY NAV */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-8">
            <div className="text-lg font-semibold tracking-tight text-slate-900">
              ManuPilot
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
              <button className="hover:text-slate-900">How it works</button>
              <button className="hover:text-slate-900">Pricing</button>
              <button className="hover:text-slate-900">Features</button>
            </nav>

            <div className="flex items-center gap-3">
              {loadingUser ? null : userEmail ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100 transition"
                >
                  Account
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.12),_transparent_55%)]" />
          <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:px-8 md:pt-24 md:pb-28">
            <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
              {/* HERO TEXT */}
              <div className="space-y-7">
                <p className="text-xs font-medium tracking-[0.32em] text-slate-500 uppercase">
                  ManuPilot
                </p>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900">
                  Your manufacturing co-pilot for turning product ideas into{' '}
                  <span className="text-sky-600">factory-ready reality.</span>
                </h1>

                <p className="text-base md:text-lg text-slate-600">
                  Describe your concept in plain language. ManuPilot guides you
                  through NDAs, specifications and supplier-ready briefs — without
                  the Alibaba chaos.
                </p>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button
                    onClick={handleQuickTestProject}
                    disabled={creating}
                    className="inline-flex items-center justify-center rounded-full px-8 py-3 bg-sky-600 text-white font-medium text-sm md:text-base shadow-[0_14px_30px_rgba(56,189,248,0.35)] hover:bg-sky-500 transition disabled:opacity-50"
                  >
                    {creating ? 'Creating…' : 'Start your first project'}
                  </button>

                  <button className="inline-flex items-center justify-center rounded-full px-8 py-3 border border-slate-300 text-slate-700 text-sm md:text-base hover:border-slate-400 hover:bg-slate-50 transition">
                    See how ManuPilot works
                  </button>
                </div>

                {createMessage && (
                  <div className="mt-3 inline-flex rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs md:text-sm text-sky-800 shadow-sm">
                    {createMessage}
                  </div>
                )}

                <div className="grid gap-4 pt-6 text-xs md:grid-cols-3 md:text-sm text-slate-500">
                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">
                      🔐
                    </span>
                    <p>Start every project under NDA so your ideas stay protected.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                      🤖
                    </span>
                    <p>AI co-pilot asks the right questions and fills in the gaps.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm">
                      📄
                    </span>
                    <p>Generate clean, factory-ready briefs you can send to suppliers.</p>
                  </div>
                </div>
              </div>

              {/* BLUEPRINT CARD */}
              <div className="relative">
                <div className="mx-auto w-full max-w-md h-80 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-[0_18px_45px_rgba(15,23,42,0.16)] overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        'linear-gradient(to_right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to_bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
                      backgroundSize: '22px 22px',
                    }}
                  />
                  <div className="relative h-full p-6 flex flex-col justify-between text-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Concept: New product
                      </span>
                      <span>ManuPilot Blueprint</span>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-sky-300/70 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-sky-700">
                          Dimensions
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-700">
                          <span>Length: 320mm</span>
                          <span>Width: 210mm</span>
                          <span>Height: 85mm</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-indigo-200/80 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="text-[11px] uppercase tracking-wide text-indigo-700">
                          Materials
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-700">
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5">
                            304 stainless
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5">
                            Food-grade silicone
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5">
                            Powder-coat
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-600">
                        <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                          MOQ
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            500
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                          Target landed
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            $8.40
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                          Timeline
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            10–12 wks
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Draft spec ready</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Send to suppliers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative z-10 bg-white">
          <div className="max-w-7xl mx-auto px-6 pt-14 pb-24 md:px-8 md:pt-20">
            <FadeInSection className="space-y-10">
              <div className="space-y-3 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  How ManuPilot works
                </h2>
                <p className="text-sm md:text-base text-slate-600">
                  From fuzzy idea to supplier-ready brief in three guided steps. No
                  spreadsheets, no eighty-reply Alibaba threads.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
                      1
                    </span>
                    <h3 className="font-semibold text-slate-900 text-base">
                      Describe your idea
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Start a project, answer simple questions about what you&apos;re
                    building, who it&apos;s for and how it should feel.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                      2
                    </span>
                    <h3 className="font-semibold text-slate-900 text-base">
                      Let the co-pilot refine it
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    ManuPilot turns your answers into structured specs: dimensions,
                    materials, constraints, target costs and more.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                      3
                    </span>
                    <h3 className="font-semibold text-slate-900 text-base">
                      Export a factory-ready brief
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Download a clean brief or send it straight to your sourcing
                    partner — everything captured in one place.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 md:px-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
            <p>
              ManuPilot © {new Date().getFullYear()} — Built for creators, founders
              and product innovators.
            </p>
            <div className="flex gap-4">
              <button className="hover:text-slate-700">Privacy</button>
              <button className="hover:text-slate-700">Terms</button>
            </div>
          </div>
        </footer>
      </main>

      {/* AUTH MODALS */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <ChatWidget />
    </>
  );
}