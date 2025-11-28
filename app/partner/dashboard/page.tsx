'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

const mockPartnerProjects = [
    { id: "1", name: "SkyTech WiFi Drop", customer: "Brand A", stage: "RFQ", due: "15 Feb 2026", status: "Action Required" },
    { id: "2", name: "Ergonomic Coffee Press", customer: "Brand B", stage: "Sampling", due: "30 Mar 2026", status: "In Progress" },
    { id: "3", name: "Compact Fire Grill", customer: "Brand C", stage: "Production", due: "10 May 2026", status: "On Track" },
];

export default function PartnerProjectsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Partner Projects</h1>
                <p className="text-slate-500 mt-1">Manage your active quotes and production orders.</p>
            </div>

            <div className="grid gap-4">
                {mockPartnerProjects.map((project) => (
                    <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${project.stage === 'RFQ' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    project.stage === 'Sampling' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                    {project.stage}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>{project.customer}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Due: {project.due}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/partner/projects/${project.id}`}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                            View Project
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
