import { loadProject } from '@/lib/project-loader';
import ProjectShell from '@/components/project/ProjectShell';
import { Camera, CheckCircle2, Clock, Plus, XCircle } from 'lucide-react';

export default async function ProjectSamplesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    return (
        <ProjectShell
            projectId={project.id}
            title={project.title}
            activeView="samples"
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Samples & Quality</h1>
                        <p className="text-slate-500">Track samples and manage quality inspections.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                        <Plus className="w-4 h-4" />
                        Request Sample
                    </button>
                </div>

                {/* 1. SAMPLE TRACKING */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900">Sample History</h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {/* Sample Item */}
                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        V1
                                    </span>
                                    <h3 className="font-bold text-slate-900">Initial Prototype</h3>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> In Transit
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">
                                    Sent via DHL (Tracking: #123456789). Expected delivery: Oct 24.
                                </p>
                                <div className="flex gap-4 text-xs text-slate-400">
                                    <span>Requested: Oct 10</span>
                                    <span>Shipped: Oct 15</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <button className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    Mark as Received
                                </button>
                                <button className="w-full py-2 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                    View Tracking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. QUALITY CHECKLIST */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Quality Checklist</h2>
                            <p className="text-sm text-slate-500">Verify these points when reviewing the sample.</p>
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                            0/5 Checked
                        </span>
                    </div>

                    <div className="space-y-3">
                        {[
                            "Check overall dimensions match specs",
                            "Verify material finish and color",
                            "Test weight capacity/durability",
                            "Inspect logo placement and quality",
                            "Check packaging condition"
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="mt-0.5 w-5 h-5 rounded border border-slate-300 flex items-center justify-center group-hover:border-slate-400 bg-white">
                                    {/* Checkbox state would go here */}
                                </div>
                                <span className="text-sm text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. PHOTO DOCUMENTATION */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Photo Documentation</h2>
                            <p className="text-sm text-slate-500">Upload photos of issues or approved details.</p>
                        </div>
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <Camera className="w-4 h-4" /> Add Photos
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
                            <Plus className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Upload</span>
                        </div>
                        {/* Placeholder for uploaded images */}
                    </div>
                </div>

                {/* 4. FINAL EVALUATION */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Final Evaluation</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Approve Sample
                        </button>
                        <button className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Request Revision
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-3">
                        Approving will move the project to the Pre-Production phase.
                    </p>
                </div>

            </div>
        </ProjectShell>
    );
}
