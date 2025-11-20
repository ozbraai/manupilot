// components/playbook/PlaybookPremiumUpsell.tsx

'use client';

import React from 'react';

// === [1] COMPONENT ROOT ===
export default function PlaybookPremiumUpsell() {
  return (
    <section className="mt-12">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-10">
        {/* === [1.1] HEADING === */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Want a complete manufacturing plan for your product?
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            Upgrade to unlock full cost breakdowns, BOM, competitor analysis, safety & compliance insights, and more.
          </p>
        </div>

        {/* === [1.2] PRICING CARDS GRID === */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Standard Report */}
          <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Standard Report
              </h3>
              <p className="text-2xl font-semibold text-slate-900">$39</p>
              <p className="text-xs text-slate-500 mt-1">One-time</p>
            </div>

            <ul className="text-sm text-slate-700 space-y-2 flex-1 text-left">
              <li>• Full manufacturing playbook</li>
              <li>• Cost breakdown (materials, assembly, tooling)</li>
              <li>• Bill of Materials (BOM)</li>
              <li>• Competitor benchmarking</li>
              <li>• Compliance checklist</li>
            </ul>

            <button className="mt-5 w-full rounded-full bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition">
              Get Standard Report
            </button>
          </div>

          {/* Pro Membership */}
          <div className="relative flex flex-col rounded-2xl border border-sky-400 bg-sky-50 p-6 shadow-md md:scale-105 md:-mt-2">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Most popular
            </span>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Pro Membership
              </h3>
              <p className="text-2xl font-semibold text-slate-900">$9</p>
              <p className="text-xs text-slate-500 mt-1">Monthly</p>
            </div>

            <ul className="text-sm text-slate-800 space-y-2 flex-1 text-left">
              <li>• Everything in Standard Report</li>
              <li>• Unlimited full reports</li>
              <li>• Unlimited revisions as your idea evolves</li>
              <li>• Save playbooks to your account</li>
              <li>• Export clean, branded PDFs</li>
            </ul>

            <button className="mt-5 w-full rounded-full bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-500 transition">
              Join Pro Membership
            </button>
          </div>

          {/* Premium Bundle */}
          <div className="relative flex flex-col rounded-2xl border border-amber-300 bg-amber-50/60 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Premium Bundle
              </h3>
              <p className="text-2xl font-semibold text-slate-900">$99</p>
              <p className="text-xs text-slate-500 mt-1">One-time</p>
            </div>

            <ul className="text-sm text-slate-800 space-y-2 flex-1 text-left">
              <li>• Everything in Pro Membership</li>
              <li>• Personalised sourcing strategy</li>
              <li>• Factory outreach template pack</li>
              <li>• Supplier scoring & comparison sheet</li>
              <li>• Packaging & launch checklist</li>
              <li>• Early access to future ManuPilot tools</li>
            </ul>

            <button className="mt-5 w-full rounded-full bg-amber-500 text-slate-900 text-sm font-medium py-2.5 hover:bg-amber-400 transition">
              Upgrade to Premium Bundle
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}