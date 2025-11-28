'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { useWizard } from '@/components/wizard/WizardContext';
import { LoginModal } from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import NotificationBell from '@/components/messaging/NotificationBell';


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // Auth state from provider
  const { user, signOut } = useAuth();
  const { openWizard } = useWizard();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync local state with provider
  useEffect(() => {
    setUserEmail(user?.email ?? null);
    setIsAdmin(user?.app_metadata?.role === 'admin');
  }, [user]);

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
    // The auth state is now managed by useAuth, so we only need the premium flag here.
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('manupilot_include_premium');
      if (stored === 'true') setIncludePremium(true);
    }
  }, []);

  // === [1.5] CLICK OUTSIDE HANDLER ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openMenu) return;

      const target = event.target as HTMLElement;
      // If click is inside a dropdown container (trigger or menu), ignore
      if (target.closest('[data-dropdown-container]')) return;

      setOpenMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

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
    await signOut();
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
      <header className="sticky top-0 z-50 glass border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          {/* LEFT: LOGO + DESKTOP NAV */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-2"
              onClick={closeAllMenus}
            >
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">MP</div>
              ManuPilot
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-600">


              <Link
                href="/how-it-works"
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                onClick={closeAllMenus}
              >
                How it works
              </Link>

              <Link
                href="/blog"
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                onClick={closeAllMenus}
              >
                Blog
              </Link>

              {/* Marketplace dropdown */}
              <div className="relative group" data-dropdown-container>
                <button
                  type="button"
                  onClick={() => toggleDropdown('marketplace')}
                  className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  Marketplace
                  <span className="text-[10px] opacity-50">▼</span>
                </button>
                {openMenu === 'marketplace' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl shadow-zinc-200/50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Directory</div>
                    <Link
                      href="/agents"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Sourcing Agents
                    </Link>
                    <Link
                      href="/manufacturers"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Manufacturers
                    </Link>
                    <Link
                      href="/shipping-partners"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Logistics Partners
                    </Link>
                    <Link
                      href="/legal-services"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Legal & IP Services
                    </Link>
                  </div>
                )}
              </div>

              {/* Learning dropdown */}
              <div className="relative" data-dropdown-container>
                <button
                  type="button"
                  onClick={() => toggleDropdown('learning')}
                  className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  Learning
                  <span className="text-[10px] opacity-50">▼</span>
                </button>
                {openMenu === 'learning' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl shadow-zinc-200/50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resources</div>
                    <Link
                      href="/academy/guides"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Guides
                    </Link>
                    <Link
                      href="/academy/playbooks"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Playbooks
                    </Link>
                    <Link
                      href="/academy/templates"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Templates
                    </Link>
                    <Link
                      href="/academy/courses"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Courses
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                onClick={closeAllMenus}
              >
                About
              </Link>

            </nav>
          </div>

          {/* RIGHT: DESKTOP AUTH / ACCOUNT */}
          <div className="hidden md:flex items-center gap-3">
            {userEmail && <NotificationBell />}

            {/* Validate Idea Button - Always visible or only when logged in?
                Assuming always visible as a CTA, but it opens wizard which requires auth/NDA.
                If user is not logged in, wizard handles it (or redirects).
                Let's show it always for now as a primary CTA.
            */}
            <button
              onClick={openWizard}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              + Validate Idea
            </button>

            {!userEmail ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setShowLogin(true);
                  }}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    setShowRegister(true);
                  }}
                  className="px-5 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 hover:shadow-xl hover:shadow-zinc-900/20 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="relative" data-dropdown-container>
                <button
                  type="button"
                  onClick={() => toggleDropdown('account')}
                  className="px-4 py-2 rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">👤</div>
                  Account
                </button>
                {openMenu === 'account' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl shadow-zinc-200/50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-100 mb-2">
                      <p className="text-xs font-medium text-zinc-500">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate">{userEmail}</p>
                    </div>

                    {/* Moved Nav Items */}
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Projects
                    </Link>
                    <Link
                      href="/rfqs"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      RFQs
                    </Link>
                    <Link
                      href="/messages"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Messages
                    </Link>

                    <div className="my-2 border-t border-zinc-100"></div>

                    {/* Admin Link */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mb-1 font-medium"
                        onClick={closeAllMenus}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account/profile"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/settings"
                      className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                      onClick={closeAllMenus}
                    >
                      Settings
                    </Link>

                    {/* Premium toggle */}
                    <div className="px-3 py-2 border-t border-zinc-100 mt-2 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-500">
                          Premium Features
                        </span>
                        <button
                          type="button"
                          onClick={togglePremium}
                          className={
                            'relative inline-flex items-center h-5 w-9 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 ' +
                            (includePremium
                              ? 'bg-zinc-900 border-zinc-900'
                              : 'bg-zinc-200 border-zinc-300')
                          }
                        >
                          <span
                            className={
                              'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ' +
                              (includePremium ? 'translate-x-4' : 'translate-x-0.5')
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mt-1"
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
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setOpenMenu(null);
            }}
          >
            {mobileOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>

        {/* MOBILE NAV PANEL */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-xl absolute w-full left-0 shadow-2xl">
            <nav className="px-4 py-6 flex flex-col gap-4 text-base font-medium text-zinc-800">
              <Link
                href="/dashboard"
                onClick={closeAllMenus}
                className="py-2 px-4 hover:bg-zinc-50 rounded-lg"
              >
                Projects
              </Link>
              <Link
                href="/rfqs"
                onClick={closeAllMenus}
                className="py-2 px-4 hover:bg-zinc-50 rounded-lg"
              >
                RFQs
              </Link>
              <Link
                href="/how-it-works"
                onClick={closeAllMenus}
                className="py-2 px-4 hover:bg-zinc-50 rounded-lg"
              >
                How it works
              </Link>
              <Link
                href="/blog"
                onClick={closeAllMenus}
                className="py-2 px-4 hover:bg-zinc-50 rounded-lg"
              >
                Blog
              </Link>

              {/* Mobile marketplace */}
              <details className="group">
                <summary className="cursor-pointer list-none py-2 px-4 hover:bg-zinc-50 rounded-lg flex justify-between items-center">
                  Marketplace
                  <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 ml-4 pl-4 border-l border-zinc-200 flex flex-col gap-2">
                  <Link
                    href="/agents"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Agents
                  </Link>
                  <Link
                    href="/manufacturers"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Manufacturers
                  </Link>
                  <Link
                    href="/shipping-partners"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Shipping partners
                  </Link>
                  <Link
                    href="/legal-services"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Legal & IP services
                  </Link>
                </div>
              </details>

              {/* Mobile learning */}
              <details className="group">
                <summary className="cursor-pointer list-none py-2 px-4 hover:bg-zinc-50 rounded-lg flex justify-between items-center">
                  Learning
                  <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 ml-4 pl-4 border-l border-zinc-200 flex flex-col gap-2">
                  <Link
                    href="/academy/guides"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Guides
                  </Link>
                  <Link
                    href="/academy/playbooks"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Playbooks
                  </Link>
                  <Link
                    href="/academy/templates"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/academy/courses"
                    onClick={closeAllMenus}
                    className="py-2 text-sm text-zinc-600"
                  >
                    Courses
                  </Link>
                </div>
              </details>

              {/* Mobile premium toggle */}
              <div className="pt-4 flex items-center justify-between gap-2 border-t border-zinc-100 mt-2 px-4">
                <span className="text-sm text-zinc-600">
                  Show Premium sections
                </span>
                <button
                  type="button"
                  onClick={togglePremium}
                  className={
                    'relative inline-flex items-center h-6 w-11 rounded-full border transition-colors ' +
                    (includePremium
                      ? 'bg-zinc-900 border-zinc-900'
                      : 'bg-zinc-200 border-zinc-300')
                  }
                >
                  <span
                    className={
                      'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ' +
                      (includePremium ? 'translate-x-6' : 'translate-x-1')
                    }
                  />
                </button>
              </div>

              {/* Mobile auth/account */}
              {!userEmail ? (
                <div className="pt-4 flex flex-col gap-3 px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(true);
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(true);
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white text-base font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="pt-4 flex flex-col gap-2 px-4 pb-4 border-t border-zinc-100 mt-2">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Account</div>
                  <Link
                    href="/account/profile"
                    onClick={closeAllMenus}
                    className="py-2 text-zinc-600 hover:text-zinc-900"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/settings"
                    onClick={closeAllMenus}
                    className="py-2 text-zinc-600 hover:text-zinc-900"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-red-600 hover:text-red-700"
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
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

    </>
  );
}