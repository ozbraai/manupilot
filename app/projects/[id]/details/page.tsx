import { loadProject } from '@/lib/project-loader';
import ProjectShell from '@/components/project/ProjectShell';
import { calculateSpecCompleteness } from '@/lib/spec-completeness';
import { CheckCircle2, ChevronRight, Edit2, Plus } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    // We need to cast the loaded project back to the shape expected by calculateSpecCompleteness
    // or update calculateSpecCompleteness to accept LoadedProject. For now, we'll cast.
    const completeness = calculateSpecCompleteness(project as any);
    const isReadyForRFQ = completeness.percentage >= 80;

    return (
        <ProjectShell
            projectId={project.id}
            title={project.title}
            activeView="bom"
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Details</h1>
                    <p className="text-slate-500">Define your product specifications to get accurate quotes.</p>
                </div>

                {/* 1. SPECIFICATION COMPLETENESS */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Specification Completeness</h2>
                        <span className={`text-sm font-bold ${completeness.percentage >= 80 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                            {completeness.percentage}% {completeness.percentage >= 80 ? 'Ready for RFQ' : 'Incomplete'}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${completeness.percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                            style={{ width: `${completeness.percentage}%` }}
                        />
                    </div>

                    {/* Missing Items */}
                    {completeness.missing.length > 0 && (
                        <div className="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Missing for suppliers:</p>
                            <ul className="space-y-1">
                                {completeness.missing.map((item) => (
                                    <li key={item.field} className="text-sm text-slate-700 flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.required ? 'bg-red-500' : 'bg-amber-400'}`} />
                                        {item.label}
                                        {item.required && <span className="text-xs text-red-500 font-medium">(required)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        disabled={!isReadyForRFQ || !!project.specs_confirmed_at}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${project.specs_confirmed_at
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : isReadyForRFQ
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {project.specs_confirmed_at ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Specifications Confirmed
                            </>
                        ) : (
                            <>
                                Confirm Specifications
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    {!isReadyForRFQ && (
                        <p className="text-xs text-slate-400 mt-2">
                            Complete at least 80% of specifications to confirm.
                        </p>
                    )}
                </div>

                {/* 2. PRODUCT OVERVIEW */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-900">Product Overview</h2>
                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit
                        </button>
                    </div>
                    <div className="p-6 grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Materials</h3>
                            <ul className="space-y-2">
                                {(project.playbook_snapshot?.ai_baseline?.materials || []).map((mat: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-center justify-between group">
                                        <span>• {mat}</span>
                                        <button className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-600">Edit</button>
                                    </li>
                                ))}
                                <li>
                                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add material
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Features</h3>
                            <ul className="space-y-2">
                                {(project.playbook_snapshot?.ai_baseline?.keyFeatures || []).map((feat: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-center justify-between group">
                                        <span>• {feat}</span>
                                        <button className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-600">Edit</button>
                                    </li>
                                ))}
                                <li>
                                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add feature
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. TECHNICAL SPECIFICATIONS */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900">Technical Specifications</h2>
                        <p className="text-xs text-slate-500">These details help suppliers quote accurately.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {/* Dimensions */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-slate-900">Dimensions</h3>
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Required</span>
                            </div>
                            {project.playbook_snapshot?.ai_baseline?.dimensions ? (
                                <p className="text-sm text-slate-700">{project.playbook_snapshot.ai_baseline.dimensions}</p>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 border-dashed text-center">
                                    <p className="text-sm text-slate-500 mb-2">Not specified yet</p>
                                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                        Add dimensions &rarr;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Weight Capacity */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-slate-900">Weight Capacity</h3>
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Required</span>
                            </div>
                            {project.playbook_snapshot?.ai_baseline?.weight ? (
                                <p className="text-sm text-slate-700">{project.playbook_snapshot.ai_baseline.weight}</p>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 border-dashed">
                                    <p className="text-sm text-slate-500 mb-2 text-center">Not specified yet</p>
                                    <div className="flex justify-center gap-3">
                                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm">
                                            Suggest: 250 lbs
                                        </button>
                                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                            Enter custom
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colors */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-slate-900">Color Options</h3>
                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">Recommended</span>
                            </div>
                            {(project.playbook_snapshot?.ai_baseline?.colors || []).length > 0 ? (
                                <div className="flex gap-2">
                                    {project.playbook_snapshot!.ai_baseline!.colors!.map((color: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded border border-slate-200">
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add color options
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. COMPONENT BREAKDOWN */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-900">Component Breakdown</h2>
                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit
                        </button>
                    </div>

                    {project.components.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Component</th>
                                        <th className="px-6 py-3">Material</th>
                                        <th className="px-6 py-3">Supplier Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {project.components.map((comp, idx) => (
                                        <tr key={idx} className="bg-white hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{comp.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{comp.material_specification}</td>
                                            <td className="px-6 py-4 text-slate-600">{comp.supplier_type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add component
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                                <span className="text-xl">🔧</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">No components defined yet</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                                Components help you understand manufacturing complexity and identify supplier types needed.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    Generate from AI ✨
                                </button>
                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                    Add manually +
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </ProjectShell>
    );
}
