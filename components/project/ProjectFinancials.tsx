'use client';

import React, { useState, useEffect } from 'react';
import { PlaybookV2 } from '@/types/playbook';

type ProjectFinancialsProps = {
    playbook: PlaybookV2;
};

// Helper to parse currency strings like "$10" or "$10 - $15"
function parseCurrency(val: string | undefined): { min: number; max: number; avg: number } | null {
    if (!val) return null;
    // Remove $ and commas
    const clean = val.replace(/[$,]/g, '');

    // Check for range
    if (clean.includes('-') || clean.includes('–')) {
        const parts = clean.split(/[-–]/).map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { min: parts[0], max: parts[1], avg: (parts[0] + parts[1]) / 2 };
        }
    }

    // Single value
    const num = parseFloat(clean);
    if (!isNaN(num)) {
        return { min: num, max: num, avg: num };
    }

    return null;
}

// Helper to format currency
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function ProjectFinancials({ playbook }: ProjectFinancialsProps) {
    if (!playbook) return null;

    const { constraints, costEstimate } = playbook;

    // === PARSE DATA ===
    const targetCost = parseCurrency(constraints.targetUnitPrice);
    const maxCost = parseCurrency(constraints.maxUnitPrice);
    const estCost = parseCurrency(costEstimate?.unitCostRange);

    const targetMoq = parseInt(constraints.moq || '0', 10);
    const estMoq = parseCurrency(costEstimate?.moqRange); // Using currency parser for range logic, ignoring $ if missing

    const estRetail = parseCurrency(costEstimate?.retailRange);
    const estPackaging = parseCurrency(costEstimate?.packagingCostRange);

    // === SIMULATOR STATE ===
    const [simCost, setSimCost] = useState(0);
    const [simRetail, setSimRetail] = useState(0);
    const [simQty, setSimQty] = useState(0);

    // Initialize simulator with estimates
    useEffect(() => {
        if (estCost) setSimCost(estCost.avg);
        if (estRetail) setSimRetail(estRetail.avg);
        if (targetMoq) setSimQty(targetMoq);
        else if (estMoq) setSimQty(estMoq.avg);
        else setSimQty(500);
    }, [JSON.stringify(estCost), JSON.stringify(estRetail), targetMoq, JSON.stringify(estMoq)]);

    const simMargin = simRetail - simCost;
    const simMarginPercent = simRetail > 0 ? (simMargin / simRetail) * 100 : 0;
    const simTotalProfit = simMargin * simQty;

    // === VERDICTS ===
    let costVerdict = "No target cost set.";
    let costVerdictColor = "text-slate-500";

    if (targetCost && estCost) {
        if (targetCost.avg >= estCost.min && targetCost.avg <= estCost.max) {
            costVerdict = "Your target cost is realistic.";
            costVerdictColor = "text-emerald-600";
        } else if (targetCost.avg < estCost.min) {
            costVerdict = "Your target cost seems aggressive for this category.";
            costVerdictColor = "text-amber-600";
        } else {
            costVerdict = "Your target cost gives some buffer above typical estimates.";
            costVerdictColor = "text-sky-600";
        }
    }

    // Initial Investment Calc
    const initialInventoryMin = (estCost?.min || 0) * (targetMoq || estMoq?.min || 0);
    const initialInventoryMax = (estCost?.max || 0) * (targetMoq || estMoq?.max || 0);

    return (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">

            {/* 1. COST & MOQ ROW */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Cost Overview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">
                            Cost Overview
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Target Unit Cost</span>
                                <span className="font-semibold text-slate-900">{constraints.targetUnitPrice || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Max Acceptable</span>
                                <span className="font-semibold text-slate-700">{constraints.maxUnitPrice || 'Not set'}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-slate-900">AI Estimate</span>
                                    <span className="font-bold text-indigo-600">{costEstimate?.unitCostRange || 'N/A'}</span>
                                </div>
                                <p className={`text-xs ${costVerdictColor} font-medium`}>
                                    {costVerdict}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOQ & Volume */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">
                            MOQ & Volume
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Preferred MOQ</span>
                                <span className="font-semibold text-slate-900">{constraints.moq || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Est. Supplier MOQ</span>
                                <span className="font-semibold text-indigo-600">{costEstimate?.moqRange || 'N/A'}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    For {playbook.category?.toLowerCase() || 'this'} products, lower MOQs often mean higher unit costs. Aiming for {estMoq?.min || 500}+ units usually unlocks better pricing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PRICING SIMULATOR */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                        Pricing & Margin Simulator
                    </h4>
                    <p className="text-sm text-slate-500">
                        Adjust values to see how pricing affects your gross profit.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="space-y-5 lg:col-span-1">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Cost ($)</label>
                            <input
                                type="range"
                                min="0"
                                max={(estCost?.max || 100) * 2}
                                step="0.1"
                                value={simCost}
                                onChange={(e) => setSimCost(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="mt-2 flex justify-between">
                                <input
                                    type="number"
                                    value={simCost}
                                    onChange={(e) => setSimCost(parseFloat(e.target.value))}
                                    className="w-24 p-1 text-sm border border-slate-300 rounded text-center font-semibold text-slate-900"
                                />
                                <span className="text-xs text-slate-400 self-center">Est: {costEstimate?.unitCostRange}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Retail Price ($)</label>
                            <input
                                type="range"
                                min="0"
                                max={(estRetail?.max || 200) * 2}
                                step="1"
                                value={simRetail}
                                onChange={(e) => setSimRetail(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="mt-2 flex justify-between">
                                <input
                                    type="number"
                                    value={simRetail}
                                    onChange={(e) => setSimRetail(parseFloat(e.target.value))}
                                    className="w-24 p-1 text-sm border border-slate-300 rounded text-center font-semibold text-slate-900"
                                />
                                <span className="text-xs text-slate-400 self-center">Est: {costEstimate?.retailRange}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity (Units)</label>
                            <input
                                type="range"
                                min="100"
                                max="10000"
                                step="100"
                                value={simQty}
                                onChange={(e) => setSimQty(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                            />
                            <div className="mt-2 text-right">
                                <span className="text-sm font-bold text-slate-900">{simQty} units</span>
                            </div>
                        </div>
                    </div>

                    {/* Outputs */}
                    <div className="lg:col-span-2 bg-slate-50 rounded-xl p-6 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Gross Margin / Unit</p>
                                <p className={`text-3xl font-bold ${simMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {formatMoney(simMargin)}
                                </p>
                                <p className="text-sm font-medium text-slate-400 mt-1">{simMarginPercent.toFixed(1)}%</p>
                            </div>
                            <div className="text-center border-l border-slate-200">
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Gross Profit</p>
                                <p className={`text-3xl font-bold ${simTotalProfit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                    {formatMoney(simTotalProfit)}
                                </p>
                                <p className="text-sm font-medium text-slate-400 mt-1">@ {simQty} units</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. INVESTMENT SNAPSHOT */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-800 mb-2">
                        Estimated Inventory Investment
                    </h4>
                    <p className="text-sm text-indigo-900/70 max-w-lg">
                        Based on your target MOQ and estimated unit costs, this is the capital required for your first production run (excluding tooling & shipping).
                    </p>
                </div>
                <div className="text-right min-w-[200px]">
                    <p className="text-2xl font-bold text-indigo-900">
                        {formatMoney(initialInventoryMin)} – {formatMoney(initialInventoryMax)}
                    </p>
                    <p className="text-xs font-medium text-indigo-400 mt-1">
                        + {costEstimate?.packagingCostRange || 'TBD'} packaging
                    </p>
                </div>
            </div>

        </section>
    );
}
