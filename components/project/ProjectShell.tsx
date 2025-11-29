'use client';

import React, { useState } from 'react';
import ProjectSidebar from '@/components/project/ProjectSidebar';

type ProjectShellProps = {
    title: string;
    subtitle?: string;
    badges?: { label: string; value?: string; color?: string }[];
    navItems?: any[];
    phases?: any[];
    activeView: string;
    onChangeView: (view: any) => void;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    rfqStatus?: 'draft' | 'submitted' | 'in_review' | 'completed';
    projectImage?: string;
    progress?: number;
};

export default function ProjectShell({
    title,
    subtitle,
    badges,
    navItems,
    phases,
    activeView,
    onChangeView,
    children,
    headerActions,
    rfqStatus,
    projectImage,
    progress
}: ProjectShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50 flex">

            {/* === MOBILE OVERLAY === */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* === 1. LEFT SIDEBAR === */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:sticky lg:top-16 lg:inset-y-auto lg:h-[calc(100vh-4rem)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <ProjectSidebar
                    activeView={activeView}
                    onChangeView={(view) => {
                        onChangeView(view);
                        setSidebarOpen(false);
                    }}
                    title={title}
                    rfqStatus={rfqStatus}
                    navItems={navItems}
                />
            </div>

            {/* === 2. MAIN CONTENT AREA === */}
            <main className="flex-1 w-full p-4 md:p-8 lg:p-12">

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-zinc-200 rounded-lg shadow-sm"
                >
                    <svg className="w-6 h-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Top Header */}
                <div className="mb-10 mt-12 lg:mt-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            {/* Thumbnail */}
                            {projectImage && (
                                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={projectImage}
                                        alt={`${title} thumbnail`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
                                {subtitle && <p className="text-slate-500 mt-2 text-sm md:text-base">{subtitle}</p>}

                                {badges && badges.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {badges.map((badge, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                            >
                                                {badge.label}{badge.value ? `: ${badge.value}` : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 md:items-end">
                            {headerActions}

                            {progress !== undefined && (
                                <div className="text-left md:text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Progress</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-full md:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${progress}%` }} />
                                        </div>
                                        <span className="text-lg font-bold text-slate-900">{progress}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-px bg-slate-200 w-full" />
                </div>

                {/* CONTENT */}
                {children}

            </main>
        </div>
    );
}
