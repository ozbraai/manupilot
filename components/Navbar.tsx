'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }
    loadUser();
  }, []);

  function toggleMenu(menu: string) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function handleAuthSuccess(email: string | null) {
    setUserEmail(email);
    setShowLogin(false);
    setShowRegister(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:px-8">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-10">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              ManuPilot
            </Link>

            <Link
              href="/dashboard"
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              Projects
            </Link>

            <Link
              href="/about"
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              About
            </Link>

            <Link
              href="/how-it-works"
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              How it works
            </Link>

            {/* MARKETPLACE DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('marketplace')}
                className="text-sm text-slate-700 hover:text-slate-900"
              >
                Marketplace ▾
              </button>
              {openMenu === 'marketplace' && (
                <div className="absolute mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                  <Link
                    href="/agents"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Agents
                  </Link>
                  <Link
                    href="/manufacturers"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Manufacturers
                  </Link>
                  <Link
                    href="/shipping-partners"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Shipping partners
                  </Link>
                  <Link
                    href="/legal-services"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Legal & IP services
                  </Link>
                </div>
              )}
            </div>

            {/* LEARNING DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('academy')}
                className="text-sm text-slate-700 hover:text-slate-900"
              >
                Learning ▾
              </button>
              {openMenu === 'academy' && (
                <div className="absolute mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                  <Link
                    href="/academy/guides"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Guides
                  </Link>
                  <Link
                    href="/academy/playbooks"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Playbooks
                  </Link>
                  <Link
                    href="/academy/templates"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/academy/courses"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                  >
                    Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {!userEmail ? (
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
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu('account')}
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100 transition"
                >
                  Account ▾
                </button>
                {openMenu === 'account' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                    <Link
                      href="/account/profile"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/settings"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setUserEmail(null);
                        window.location.href = '/';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-lg"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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