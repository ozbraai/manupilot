'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  ListChecks,
  BadgeDollarSign,
  Factory,
  FlaskConical,
  Route,
  ClipboardList,
  Activity,
  Ship,
  Truck,
  Folder,
  LucideIcon
} from 'lucide-react';

export type View = 'overview' | 'bom' | 'financials' | 'roadmap' | 'sourcing' | 'samples';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  disabled?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface Phase {
  id: string;
  title: string;
}

type ProjectSidebarProps = {
  activeView: string;
  onChangeView: (view: View) => void;
  title: string;
  rfqStatus?: 'draft' | 'submitted' | 'in_review' | 'completed';
  navItems?: NavItem[];
  phases?: Phase[];
};

const defaultPhases: Phase[] = [
  { id: 'phase-1', title: 'PHASE 1 — PRODUCT DEFINITION' },
  { id: 'phase-2', title: 'PHASE 2 — SOURCING & VALIDATION' },
  { id: 'phase-3', title: 'PHASE 3 — PRODUCTION' },
  { id: 'phase-4', title: 'PHASE 4 — LOGISTICS & IMPORTING' },
  { id: 'assets', title: 'ASSETS' },
];

export default function ProjectSidebar({ activeView, onChangeView, title, rfqStatus, navItems: customNavItems, phases: customPhases }: ProjectSidebarProps) {

  const defaultNavItems: NavItem[] = [
    // PHASE 1: PRODUCT DEFINITION
    { id: 'overview', label: 'Product Overview', icon: Home, group: 'phase-1' },
    { id: 'bom', label: 'Product Details', icon: ListChecks, group: 'phase-1' },
    { id: 'financials', label: 'Cost & Pricing', icon: BadgeDollarSign, group: 'phase-1' },

    // PHASE 2: SOURCING & VALIDATION
    {
      id: 'sourcing',
      label: 'Suppliers & Quotes',
      icon: Factory,
      group: 'phase-2',
      badge: rfqStatus === 'submitted' ? 'SENT' : undefined,
      badgeColor: rfqStatus === 'submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : undefined
    },
    { id: 'samples', label: 'Samples & Quality Checks', icon: FlaskConical, group: 'phase-2' },
    { id: 'roadmap', label: 'Development Roadmap', icon: Route, group: 'phase-2' },

    // PHASE 3: PRODUCTION
    { id: 'orders', label: 'Orders & Production', icon: ClipboardList, group: 'phase-3', disabled: true, badge: 'LOCKED' },
    { id: 'production-monitoring', label: 'Production Monitoring', icon: Activity, group: 'phase-3', disabled: true, badge: 'FUTURE' },

    // PHASE 4: LOGISTICS & IMPORTING
    { id: 'logistics', label: 'Shipping & Customs', icon: Ship, group: 'phase-4', disabled: true, badge: 'LOCKED' },
    { id: 'freight-tracking', label: 'Freight Tracking', icon: Truck, group: 'phase-4', disabled: true, badge: 'FUTURE' },

    // ASSETS
    { id: 'files', label: 'Project Files', icon: Folder, group: 'assets', disabled: true, badge: 'SOON' },
  ];

  const navItems = customNavItems || defaultNavItems;
  const phases = customPhases || defaultPhases;

  return (
    <aside className="w-64 bg-[#F8F9FA] flex flex-col h-full border-r border-black/5 lg:max-h-full lg:overflow-y-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Project Title Header */}
      <div className="h-16 flex items-center px-4 border-b border-black/5 bg-[#F8F9FA]">
        <div className="flex flex-col overflow-hidden w-full">
          <span className="text-[10px] font-semibold uppercase tracking-[0.6px] text-[#999999]">Project Workspace</span>
          <span className="font-semibold text-[#222222] truncate text-sm mt-0.5" title={title}>
            {title || 'Untitled Project'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        {phases.map((phase, phaseIndex) => (
          <div key={phase.id}>
            {phaseIndex > 0 && (
              <div className="h-px bg-black/5 my-2.5 mx-1" />
            )}
            <p className="px-3.5 text-[11px] font-semibold uppercase tracking-[0.6px] text-[#999999] mt-[18px] mb-1.5">
              {phase.title}
            </p>
            <div className="space-y-0.5">
              {navItems.filter(i => i.group === phase.id).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isDisabled = item.disabled;

                return (
                  <button
                    key={item.id}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && onChangeView(item.id as View)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium rounded-md transition-all duration-150 group ${isActive
                      ? 'bg-white text-[#222222] shadow-sm border border-black/8'
                      : isDisabled
                        ? 'text-[#999999] cursor-not-allowed'
                        : 'text-[#222222] hover:bg-black/[0.04]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={`flex-shrink-0 transition-colors ${isActive
                          ? 'text-black/90'
                          : isDisabled
                            ? 'text-black/30'
                            : 'text-black/55 group-hover:text-black/80'
                          }`}
                      />
                      <span className={isDisabled ? 'opacity-50' : ''}>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${item.badge === 'LOCKED'
                        ? 'bg-black/5 text-[#666666]'
                        : item.badge === 'FUTURE'
                          ? 'bg-black/[0.03] text-[#888888]'
                          : item.badge === 'SOON'
                            ? 'bg-black/[0.03] text-[#999999]'
                            : item.badgeColor || 'bg-black/5 text-[#666666]'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-black/5 bg-[#F8F9FA]">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-black/[0.04] text-sm text-[#222222] transition-all border border-black/8 hover:border-black/10 shadow-sm"
        >
          <span>←</span> Exit Project
        </Link>
      </div>
    </aside>
  );
}
