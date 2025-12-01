import { loadProject } from '@/lib/project-loader';
import ProjectShell from '@/components/project/ProjectShell';
import { CheckCircle2, ChevronRight, DollarSign, TrendingUp, Ship, Plane } from 'lucide-react';

export default async function ProjectCostsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    // Use values from DB or AI baseline
    const targetUnitCost = project.targetUnitCost || project.unitEconomics?.exWorksCost?.replace(/[^0-9.]/g, '') || '';
    const targetRetailPrice = project.targetRetailPrice || project.unitEconomics?.retailPrice?.replace(/[^0-9.]/g, '') || '';
    const targetMOQ = project.targetMOQ || project.startupCapital?.moqBasis?.replace(/[^0-9]/g, '') || '';

    const calculateMargin = () => {
        const cost = parseFloat(targetUnitCost.toString());
        const price = parseFloat(targetRetailPrice.toString());
        if (!cost || !price) return 0;
        return ((price - cost) / price) * 100;
    };

    const margin = calculateMargin();
    const isHealthyMargin = margin >= 60;

    // AI Estimates
    const aiUnitCost = project.unitEconomics?.exWorksCost || 'N/A';
    const aiRetailPrice = project.unitEconomics?.retailPrice || 'N/A';
    const aiLandedCost = project.unitEconomics?.landedCost || 'N/A';
    const aiFreight = project.unitEconomics?.freightCost || 'N/A';

    return (
        <ProjectShell
            projectId={project.id}
            title={project.title}
            activeView="costs"
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cost & Pricing</h1>
                    <p className="text-slate-500">Set your targets and analyze profitability.</p>
                </div>

                {/* 1. COST TARGETS */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Your Cost Targets</h2>
                        <span className="text-sm text-slate-500">Set your targets to unlock supplier matching.</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Target Unit Cost */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Unit Cost</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    defaultValue={targetUnitCost}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">AI suggests: {aiUnitCost}</p>
                        </div>

                        {/* Target Retail Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Retail Price</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    defaultValue={targetRetailPrice}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">AI suggests: {aiRetailPrice}</p>
                        </div>

                        {/* Target MOQ */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target MOQ</label>
                            <input
                                type="number"
                                defaultValue={targetMOQ}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                placeholder="500"
                            />
                        </div>

                        {/* Margin Display */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Margin</label>
                            <div className={`px-4 py-2 rounded-lg border flex items-center justify-between ${isHealthyMargin ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                                }`}>
                                <span className="font-bold">{margin > 0 ? `~${Math.round(margin)}%` : '-'}</span>
                                {isHealthyMargin && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            {isHealthyMargin && <p className="text-xs text-emerald-600 mt-1">Healthy margin</p>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                            Save Targets
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. COST BREAKDOWN */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-slate-900 mb-4">Estimated Cost Breakdown</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Factory Gate (EXW)</span>
                                <span className="font-medium">{aiUnitCost}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Freight & Logistics</span>
                                <span className="font-medium">{aiFreight}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center font-bold text-slate-900">
                                <span>Landed Cost</span>
                                <span>{aiLandedCost}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. LANDED COST CALCULATOR */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold text-slate-900 mb-4">Landed Cost Calculator</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Country</label>
                                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>Australia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipping Method</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                                        <Ship className="w-4 h-4" /> Sea Freight
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                                        <Plane className="w-4 h-4" /> Air Freight
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-slate-900">Landed Cost Estimate</span>
                                <span className="text-lg font-bold text-slate-900">{aiLandedCost}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>Your target: ${targetUnitCost}</span>
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Within budget
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SCENARIO COMPARISON */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-900">Volume Scenarios</h2>
                        <p className="text-xs text-slate-500">See how unit costs change at different quantities.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Metric</th>
                                    <th className="px-6 py-3">500 units</th>
                                    <th className="px-6 py-3">1,000 units</th>
                                    <th className="px-6 py-3">2,000 units</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white">
                                    <td className="px-6 py-4 font-medium text-slate-900">Unit Cost</td>
                                    <td className="px-6 py-4 text-slate-600">$15.00</td>
                                    <td className="px-6 py-4 text-emerald-600 font-medium">$13.50</td>
                                    <td className="px-6 py-4 text-emerald-600 font-bold">$12.00</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-6 py-4 font-medium text-slate-900">Landed Cost</td>
                                    <td className="px-6 py-4 text-slate-600">$17.68</td>
                                    <td className="px-6 py-4 text-slate-600">$15.80</td>
                                    <td className="px-6 py-4 text-slate-600">$14.20</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-6 py-4 font-medium text-slate-900">Total Investment</td>
                                    <td className="px-6 py-4 text-slate-600">$7,500</td>
                                    <td className="px-6 py-4 text-slate-600">$13,500</td>
                                    <td className="px-6 py-4 text-slate-600">$24,000</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-6 py-4 font-medium text-slate-900">Margin</td>
                                    <td className="px-6 py-4 text-slate-600">63%</td>
                                    <td className="px-6 py-4 text-slate-600">65%</td>
                                    <td className="px-6 py-4 text-slate-600">68%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-sm text-amber-800">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium">Insight:</span>
                        Ordering 1,000 units unlocks ~10% cost savings compared to 500 units.
                    </div>
                </div>

            </div>
        </ProjectShell>
    );
}
