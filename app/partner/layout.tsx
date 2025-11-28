'use client';

import React from 'react';
import Link from 'next/link';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Partner Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Partner Portal</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            PT
                        </div>
                    </div>
                </div>
            </header>

            {children}
        </div>
    );
}
