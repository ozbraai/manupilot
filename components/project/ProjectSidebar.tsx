'use client';

import React from 'react';
import Link from 'next/link';

type View = 'overview' | 'bom' | 'financials' | 'roadmap' | 'sourcing';

type ProjectSidebarProps = {
  activeView: View;
  onChangeView: (view: View) => void;
  title: string;
  rfqStatus?: 'draft' | 'submitted' | 'in_review' | 'completed';
};

export default function ProjectSidebar({ activeView, onChangeView, title, rfqStatus }: ProjectSidebarProps) {

  const navItems = [
    // PHASE 1: PLAN
    { id: 'overview', label: '🏠 Overview', group: 'Definition' },
    { id: 'bom', label: '🏗️ Specs & BOM', group: 'Definition' },
    { id: 'financials', label: '💰 Financials', group: 'Definition' },

    // PHASE 2: EXECUTE
    { id: 'roadmap', label: '✅ Roadmap', group: 'Execution' },
    {
      id: 'sourcing',
      label: '🏭 Suppliers & RFQ',
      group: 'Execution',
      badge: rfqStatus === 'submitted' ? 'SENT' : undefined,
      badgeColor: rfqStatus === 'submitted' ? 'bg-emerald-500 text-white' : undefined
    },
    { id: 'samples', label: '📦 Samples & QC', group: 'Execution', disabled: true, badge: 'LOCKED' },

    // PHASE 3: ORDER
    { id: 'orders', label: '📝 Purchase Orders', group: 'Procurement', disabled: true, badge: 'LOCKED' },
    { id: 'logistics', label: '🚢 Freight & Customs', group: 'Procurement', disabled: true, badge: 'LOCKED' },

    // ASSETS
    { id: 'files', label: '📂 Project Vault', group: 'Assets', disabled: true, badge: 'SOON' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col min-h-screen border-r border-zinc-800">
      {/* Project Title Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Project Workspace</span>
          <span className="font-semibold text-white truncate text-sm" title={title}>
            {title || 'Untitled Project'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-8">

        {/* Group 1: Definition */}
        <div>
          <p className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">
            Phase 1: Definition
          </p>
          <div className="space-y-1">
            {navItems.filter(i => i.group === 'Definition').map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeView === item.id
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/50 border border-zinc-700'
                  : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white'
                  }`}
              >
                <span>{item.label.split(' ')[0]}</span>
                <span className="flex-1 text-left">{item.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Group 2: Execution */}
        <div>
          <p className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">
            Phase 2: Execution
          </p>
          <div className="space-y-1">
            {navItems.filter(i => i.group === 'Execution').map((item: any) => (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => !item.disabled && onChangeView(item.id as View)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg group transition-all duration-200 ${activeView === item.id
                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/50 border border-zinc-700'
                    : item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="grayscale group-hover:grayscale-0 transition-all">{item.label.split(' ')[0]}</span>
                  <span className="text-left">{item.label.split(' ').slice(1).join(' ')}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-zinc-800 text-zinc-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Group 3: Procurement (Future) */}
        <div>
          <p className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">
            Phase 3: Procurement
          </p>
          <div className="space-y-1">
            {navItems.filter(i => i.group === 'Procurement').map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg opacity-40 cursor-not-allowed"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span>{item.label.split(' ')[0]}</span>
                  <span className="text-left">{item.label.split(' ').slice(1).join(' ')}</span>
                </div>
                <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-bold">
                  {item.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Group 4: Assets */}
        <div>
          <p className="px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">
            Assets
          </p>
          <div className="space-y-1">
            {navItems.filter(i => i.group === 'Assets').map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg opacity-40 cursor-not-allowed"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span>{item.label.split(' ')[0]}</span>
                  <span className="text-left">{item.label.split(' ').slice(1).join(' ')}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-all border border-zinc-800 hover:border-zinc-700"
        >
          <span>←</span> Exit Project
        </Link>
      </div>
    </aside>
  );
}