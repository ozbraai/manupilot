'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

export default function Navbar() {
  const router = useRouter();

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Menus
  const [openMenu, setOpenMenu] = useState<string | null>(null); // desktop dropdowns
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Premium flag
  const [includePremium, setIncludePremium] = useState(false);

  // === [1] LOAD USER & PREMIUM FLAG ===
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }

    loadUser();

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('manupilot_include_premium');
      if (stored === 'true') setIncludePremium(true);
    }
  }, []);

  // === [2] HANDLERS ===
  function toggleDropdown(menu: string) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function closeAllMenus() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  function handleAuthSuccess(email: string | null) {
    setUserEmail(email);
    setShowLogin(false);
    setShowRegister(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    closeAllMenus();
    router.push('/');
  }

  function togglePremium() {
    const next = !includePremium;
    setIncludePremium(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('manupilot_include_premium', String(next));
    }
  }

  // === [3] RENDER ===
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          {/* LEFT: LOGO + DESKTOP NAV */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-slate-900"
              onClick={closeAllMenus}
            >
              ManuPilot
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
              <Link
                href="/dashboard"
                className="hover:text-slate-900"
                onClick={closeAllMenus}
              >
                Projects
              </Link>

              <Link
                href="/about"
                className="hover:text-slate-900"
                onClick={closeAllMenus}
              >
                About
              </Link>

              <Link
                href="/how-it-works"
                className="hover:text-slate-900"
                onClick={closeAllMenus}
              >
                How it works
              </Link>

              {/* Marketplace dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('marketplace')}
                  className="hover:text-slate-900 flex items-center gap-1"
                >
                  Marketplace ▾
                </button>
                {openMenu === 'marketplace' && (
                  <div className="absolute mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                    <Link
                      href="/agents"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Agents
                    </Link>
                    <Link
                      href="/manufacturers"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Manufacturers
                    </Link>
                    <Link
                      href="/shipping-partners"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Shipping partners
                    </Link>
                    <Link
                      href="/legal-services"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Legal & IP services
                    </Link>
                  </div>
                )}
              </div>

              {/* Learning dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('learning')}
                  className="hover:text-slate-900 flex items-center gap-1"
                >
                  Learning ▾
                </button>
                {openMenu === 'learning' && (
                  <div className="absolute mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                    <Link
                      href="/academy/guides"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Guides
                    </Link>
                    <Link
                      href="/academy/playbooks"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Playbooks
                    </Link>
                    <Link
                      href="/academy/templates"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Templates
                    </Link>
                    <Link
                      href="/academy/courses"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Courses
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* RIGHT: DESKTOP AUTH / ACCOUNT */}
          <div className="hidden md:flex items-center gap-3">
            {!userEmail ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setShowLogin(true);
                  }}
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setShowRegister(true);
                  }}
                  className="px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
                >
                  Register
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('account')}
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100 transition"
                >
                  Account ▾
                </button>
                {openMenu === 'account' && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account/profile"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/settings"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                      onClick={closeAllMenus}
                    >
                      Settings
                    </Link>

                    {/* Premium toggle */}
                    <div className="px-4 py-2 border-y border-slate-100 my-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-600">
                          Show Premium sections
                        </span>
                        <button
                          type="button"
                          onClick={togglePremium}
                          className={
                            'relative inline-flex items-center h-5 w-9 rounded-full border transition ' +
                            (includePremium
                              ? 'bg-sky-500 border-sky-500'
                              : 'bg-slate-200 border-slate-300')
                          }
                        >
                          <span
                            className={
                              'inline-block h-4 w-4 rounded-full bg-white shadow transform transition ' +
                              (includePremium ? 'translate-x-4' : 'translate-x-0')
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-lg text-red-700"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setOpenMenu(null);
            }}
          >
            {mobileOpen ? (
              <span className="text-sm">✕</span>
            ) : (
              <span className="text-sm">☰</span>
            )}
          </button>
        </div>

        {/* MOBILE NAV PANEL */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 text-sm text-slate-800">
              <Link
                href="/dashboard"
                onClick={closeAllMenus}
                className="py-1"
              >
                Projects
              </Link>
              <Link href="/about" onClick={closeAllMenus} className="py-1">
                About
              </Link>
              <Link
                href="/how-it-works"
                onClick={closeAllMenus}
                className="py-1"
              >
                How it works
              </Link>

              {/* Mobile marketplace */}
              <details className="py-1">
                <summary className="cursor-pointer list-none">
                  Marketplace ▾
                </summary>
                <div className="mt-1 ml-4 flex flex-col gap-1">
                  <Link
                    href="/agents"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Agents
                  </Link>
                  <Link
                    href="/manufacturers"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Manufacturers
                  </Link>
                  <Link
                    href="/shipping-partners"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Shipping partners
                  </Link>
                  <Link
                    href="/legal-services"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Legal & IP services
                  </Link>
                </div>
              </details>

              {/* Mobile learning */}
              <details className="py-1">
                <summary className="cursor-pointer list-none">
                  Learning ▾
                </summary>
                <div className="mt-1 ml-4 flex flex-col gap-1">
                  <Link
                    href="/academy/guides"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Guides
                  </Link>
                  <Link
                    href="/academy/playbooks"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Playbooks
                  </Link>
                  <Link
                    href="/academy/templates"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/academy/courses"
                    onClick={closeAllMenus}
                    className="py-0.5"
                  >
                    Courses
                  </Link>
                </div>
              </details>

              {/* Mobile premium toggle */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 mt-2 pt-3">
                <span className="text-xs text-slate-600">
                  Show Premium sections
                </span>
                <button
                  type="button"
                  onClick={togglePremium}
                  className={
                    'relative inline-flex items-center h-5 w-9 rounded-full border transition ' +
                    (includePremium
                      ? 'bg-sky-500 border-sky-500'
                      : 'bg-slate-200 border-slate-300')
                  }
                >
                  <span
                    className={
                      'inline-block h-4 w-4 rounded-full bg-white shadow transform transition ' +
                      (includePremium ? 'translate-x-4' : 'translate-x-0')
                    }
                  />
                </button>
              </div>

              {/* Mobile auth/account */}
              {!userEmail ? (
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(true);
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(true);
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="pt-3 flex flex-col gap-2">
                  <Link
                    href="/account/profile"
                    onClick={closeAllMenus}
                    className="py-1"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/settings"
                    onClick={closeAllMenus}
                    className="py-1"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-red-700 hover:bg-red-50 transition"
                  >
                    Log out
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

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
    </>
  );
}