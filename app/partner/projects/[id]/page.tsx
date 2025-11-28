'use client';

import React, { useState } from 'react';
import ProjectShell from '@/components/project/ProjectShell';
import { Home, FileText, Ruler, FlaskConical, Calendar, MessageSquare, Folder, Ship } from 'lucide-react';

// Partner Sections Configuration
const PARTNER_SECTIONS = [
    { id: "overview", label: "Overview", icon: Home, group: 'main' },
    { id: "rfq", label: "RFQ & Quote", icon: FileText, group: 'main' },
    { id: "specs", label: "Specifications", icon: Ruler, group: 'main' },
    { id: "qc", label: "QC & Sampling", icon: FlaskConical, group: 'main' },
    { id: "timeline", label: "Timeline & Tasks", icon: Calendar, group: 'main' },
    { id: "messages", label: "Messages", icon: MessageSquare, group: 'collab' },
    { id: "files", label: "Files", icon: Folder, group: 'collab' },
    { id: "shipping", label: "Shipping & Logistics", icon: Ship, group: 'logistics' },
];

const PARTNER_PHASES = [
    { id: 'main', title: 'PROJECT DETAILS' },
    { id: 'collab', title: 'COLLABORATION' },
    { id: 'logistics', title: 'LOGISTICS' },
];

export default function PartnerProjectWorkspace() {
    const [activeView, setActiveView] = useState('overview');

    // Mock Data
    const projectTitle = "SkyTech WiFi Drop";
    const projectSubtitle = "Project with Brand A";
    const badges = [
        { label: "Stage", value: "RFQ", color: "bg-blue-50 text-blue-700 border-blue-200" },
        { label: "Status", value: "On track", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        { label: "Terms", value: "FOB Shenzhen" },
        { label: "Payment", value: "30% / 70%" },
    ];

    return (
        <ProjectShell
            title={projectTitle}
            subtitle={projectSubtitle}
            badges={badges}
            navItems={PARTNER_SECTIONS}
            phases={PARTNER_PHASES}
            activeView={activeView}
            onChangeView={setActiveView}
        >
            {/* === OVERVIEW === */}
            {activeView === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Project Overview</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                            SkyTech WiFi Drop is a compact, weather-resistant WiFi extender designed for outdoor use.
                            The product features a durable PC/ABS housing, internal PCB mounting points, and IP65-rated sealing.
                        </p>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Responsibilities</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                Provide a detailed quotation based on provided BOM and CAD.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                Confirm manufacturability (DFM) and lead times.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                Propose packaging and QC approach for IP65 validation.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Current Stage</span>
                                <span className="text-sm font-semibold text-slate-900">RFQ</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Target MOQ</span>
                                <span className="text-sm font-semibold text-slate-900">500 units</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Target Launch</span>
                                <span className="text-sm font-semibold text-slate-900">15 Feb 2026</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-500">Primary Route</span>
                                <span className="text-sm font-semibold text-slate-900">Shenzhen → Brisbane</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === RFQ === */}
            {activeView === 'rfq' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">RFQ Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Product Name</div>
                                <div className="font-medium text-slate-900">SkyTech WiFi Drop</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Category</div>
                                <div className="font-medium text-slate-900">Consumer Electronics</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Materials</div>
                                <div className="font-medium text-slate-900">PC/ABS (UV Stabilized)</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Dimensions</div>
                                <div className="font-medium text-slate-900">120 x 80 x 40 mm</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Target Price</div>
                                <div className="font-medium text-slate-900">$12.00 - $15.00 USD</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-slate-500">Certifications</div>
                                <div className="font-medium text-slate-900">CE, FCC, IP65</div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Special Instructions</p>
                            <p className="text-sm text-slate-700">Please ensure the quote includes the cost for IP65 testing and certification for the first batch.</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Quote Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Quoted EXW Price</span>
                                <span className="text-sm font-bold text-slate-900">$14.50 USD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Quoted MOQ</span>
                                <span className="text-sm font-medium text-slate-900">500 units</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Tooling (NRE)</span>
                                <span className="text-sm font-medium text-slate-900">$4,500 USD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Sample Lead Time</span>
                                <span className="text-sm font-medium text-slate-900">14 days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Production Lead Time</span>
                                <span className="text-sm font-medium text-slate-900">35 days</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">Accepted by Customer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === SPECS === */}
            {activeView === 'specs' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Product Specifications</h2>
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-2 text-slate-500">Height</td>
                                    <td className="py-2 font-medium text-slate-900">120 mm</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Width</td>
                                    <td className="py-2 font-medium text-slate-900">80 mm</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Depth</td>
                                    <td className="py-2 font-medium text-slate-900">40 mm</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Weight</td>
                                    <td className="py-2 font-medium text-slate-900">180g</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Material</td>
                                    <td className="py-2 font-medium text-slate-900">PC/ABS</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Finish</td>
                                    <td className="py-2 font-medium text-slate-900">Matte Black (VDI 24)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Operating Temp</td>
                                    <td className="py-2 font-medium text-slate-900">-20°C to +60°C</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Packaging & Labelling</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-slate-500 mb-1">Inner Box</p>
                                <p className="font-medium text-slate-900">Full color printed corrugated box (E-flute)</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-1">Outer Carton</p>
                                <p className="font-medium text-slate-900">Double wall (BC-flute), 20 units per carton</p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-1">Required Markings</p>
                                <ul className="list-disc pl-4 text-slate-700 space-y-1 mt-1">
                                    <li>EAN-13 Barcode</li>
                                    <li>CE / FCC Logos</li>
                                    <li>"Made in China"</li>
                                    <li>Serial Number Sticker</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === QC === */}
            {activeView === 'qc' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">QC Checklist</h2>
                        <ul className="space-y-3 text-sm text-slate-700">
                            {[
                                "Visual inspection for sink marks and flash",
                                "Dimension check (critical dimensions)",
                                "Assembly fit check (PCB mounting)",
                                "IP65 water spray test (sample basis)",
                                "Drop test (1m on concrete)",
                                "Barcode readability scan"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 flex items-center justify-center" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Sampling Status</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-sm font-medium text-slate-900">Sample Round 1</span>
                                <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded">In Progress</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 opacity-60">
                                <span className="text-sm font-medium text-slate-900">Sample Round 2</span>
                                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded">Pending</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 opacity-60">
                                <span className="text-sm font-medium text-slate-900">Pre-production Sample</span>
                                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === TIMELINE === */}
            {activeView === 'timeline' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Manufacturing Timeline</h2>
                        <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {[
                                { title: "RFQ Accepted", date: "Jan 10, 2026", status: "completed" },
                                { title: "Sample Production", date: "Jan 25, 2026", status: "current" },
                                { title: "Sample Approval", date: "Feb 01, 2026", status: "pending" },
                                { title: "Tooling Completion", date: "Feb 20, 2026", status: "pending" },
                                { title: "Mass Production", date: "Mar 15, 2026", status: "pending" },
                                { title: "Shipment", date: "Mar 20, 2026", status: "pending" },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${item.status === 'completed' ? 'bg-slate-900 border-slate-900' :
                                            item.status === 'current' ? 'bg-white border-blue-500 ring-4 ring-blue-50' :
                                                'bg-white border-slate-300'
                                        }`} />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-sm font-bold ${item.status === 'pending' ? 'text-slate-500' : 'text-slate-900'}`}>{item.title}</h3>
                                            <p className="text-xs text-slate-500">{item.date}</p>
                                        </div>
                                        {item.status === 'completed' && <span className="text-xs font-bold text-emerald-600">Done</span>}
                                        {item.status === 'current' && <span className="text-xs font-bold text-blue-600">In Progress</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Tasks</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                <span className="text-sm text-slate-700">Upload T1 sample photos</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                <span className="text-sm text-slate-700">Confirm packaging die-line dimensions</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* === MESSAGES === */}
            {activeView === 'messages' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Messages</h2>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                        <div className="flex flex-col gap-1">
                            <div className="self-start bg-slate-100 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                                <p className="text-sm text-slate-700">Hi, could you confirm if the PC/ABS material is UV stabilized? We need this for outdoor durability.</p>
                            </div>
                            <span className="text-[10px] text-slate-400 self-start ml-1">Brand A • 2 days ago</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="self-end bg-blue-50 text-blue-900 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                                <p className="text-sm">Yes, we have quoted for Sabic Cycoloy with UV stabilizer. I will upload the datasheet shortly.</p>
                            </div>
                            <span className="text-[10px] text-slate-400 self-end mr-1">You • 1 day ago</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="self-start bg-slate-100 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                                <p className="text-sm text-slate-700">Great, thanks! Also please check the updated CAD file I just uploaded.</p>
                            </div>
                            <span className="text-[10px] text-slate-400 self-start ml-1">Brand A • 5 hours ago</span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <textarea
                            disabled
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed resize-none"
                            placeholder="Messaging will be enabled later..."
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* === FILES === */}
            {activeView === 'files' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Project Files</h2>
                    <div className="grid gap-4">
                        {[
                            { name: "Housing_Main_v2.step", type: "3D Model", size: "4.2 MB", date: "Jan 12, 2026" },
                            { name: "Assembly_Drawing.pdf", type: "PDF", size: "1.8 MB", date: "Jan 10, 2026" },
                            { name: "Artwork_Logo.ai", type: "Vector", size: "0.5 MB", date: "Jan 10, 2026" },
                            { name: "Product_Render_Front.png", type: "Image", size: "2.1 MB", date: "Jan 08, 2026" },
                        ].map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                        <Folder size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">{file.name}</h3>
                                        <p className="text-xs text-slate-500">{file.type} • {file.size} • {file.date}</p>
                                    </div>
                                </div>
                                <button disabled className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded cursor-not-allowed">
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === SHIPPING === */}
            {activeView === 'shipping' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Shipping & Logistics</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Incoterms</p>
                                <p className="text-base font-semibold text-slate-900">FOB Shenzhen</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination Port</p>
                                <p className="text-base font-semibold text-slate-900">Brisbane, Australia (BNE)</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Shipment Window</p>
                                <p className="text-base font-semibold text-slate-900">Mar 20 - Mar 25, 2026</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Carton Config</p>
                                <p className="text-sm text-slate-700">50 x 40 x 30 cm / 12kg per carton</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Special Handling</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">Keep Dry</span>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">Max Stack 4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </ProjectShell>
    );
}
