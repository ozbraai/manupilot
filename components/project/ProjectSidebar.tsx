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
  LucideIcon,
  LogOut
} from 'lucide-react';

export type View = 'overview' | 'bom' | 'financials' | 'roadmap' | 'sourcing' | 'samples';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

type ProjectSidebarProps = {
  activeView: string;
  onChangeView: (view: View) => void;
  title: string;
  rfqStatus?: 'draft' | 'submitted' | 'in_review' | 'completed';
  navItems?: NavItem[];
};

export default function ProjectSidebar({ activeView, onChangeView, title, rfqStatus, navItems: customNavItems }: ProjectSidebarProps) {

  const defaultNavItems: NavItem[] = [
    { id: 'overview', label: 'Product Overview', icon: Home },
    { id: 'bom', label: 'Product Details', icon: ListChecks },
    { id: 'financials', label: 'Cost & Pricing', icon: BadgeDollarSign },
    {
      id: 'sourcing',
      label: 'Suppliers & Quotes',
      icon: Factory,
      badge: rfqStatus === 'submitted' ? 'SENT' : undefined,
      badgeColor: rfqStatus === 'submitted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : undefined
    },
    { id: 'samples', label: 'Samples & Quality', icon: FlaskConical },
    { id: 'roadmap', label: 'Roadmap', icon: Route },
  ];

  const navItems = customNavItems || defaultNavItems;

  return (
    <aside className="w-64 bg-white flex flex-col h-full border-r border-slate-200 lg:max-h-full lg:overflow-y-auto font-sans">
      {/* Project Title Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex flex-col overflow-hidden w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Project</span>
          <span className="font-bold text-slate-900 truncate text-sm" title={title}>
            {title || 'Untitled Project'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as View)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[14px] font-medium rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-slate-50 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon
                  size={18}
                  strokeWidth={2}
                  className={`flex-shrink-0 transition-colors ${isActive
                    ? 'text-slate-900'
                    : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${item.badgeColor || 'bg-slate-100 text-slate-500'
                  }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all text-[14px] font-medium"
        >
          <LogOut size={18} className="text-slate-400" />
          <span>Exit Project</span>
        </Link>
      </div>
    </aside>
  );
}
