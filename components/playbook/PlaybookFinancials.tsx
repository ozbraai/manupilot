'use client';

import React, { useState, useEffect } from 'react';
import { PlaybookUserOverrides } from '@/types/playbook';

type Financials = {
  complexityTier?: string;
  unitEconomics?: {
    exWorksCost?: string;
    freightCost?: string;
    landedCost?: string;
    retailPrice?: string;
    grossMargin?: string;
  };
  startupCapital?: {
    tooling?: string;
    prototyping?: string;
    certification?: string;
    firstBatchCost?: string;
    totalLaunchBudget?: string;
    moqBasis?: string;
    industryStandardMOQ?: string;
  };
  hiddenCosts?: string[];
  logisticDetails?: {
    tariffCode?: string;
    dutyRate?: string;
  };
};

type Props = {
  financials: Financials;
  preview?: boolean;
  userOverrides?: PlaybookUserOverrides;
  onUpdateOverrides?: (overrides: PlaybookUserOverrides) => void;
};

// Helper to parse dollar strings like "$25.00" to numbers
function parseDollar(str?: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

// Helper to format numbers as dollar strings
function formatDollar(num: number): string {
  return `$${num.toFixed(2)}`;
}

export default function PlaybookFinancials({
  financials,
  preview = false,
  userOverrides,
  onUpdateOverrides
}: Props) {
  if (!financials) return null;

  // AI baseline values
  const aiRetail = parseDollar(financials.unitEconomics?.retailPrice);
  const aiLanded = parseDollar(financials.unitEconomics?.landedCost);
  const aiMOQ = parseDollar(financials.startupCapital?.moqBasis);
  const aiMargin = financials.unitEconomics?.grossMargin;

  // User adjustable values (defaults to AI if no overrides)
  const [userRetail, setUserRetail] = useState(userOverrides?.retailPrice || aiRetail);
  const [userLanded, setUserLanded] = useState(userOverrides?.landedCost || aiLanded);
  const [userMOQ, setUserMOQ] = useState(userOverrides?.moq || aiMOQ);
  const [isEditing, setIsEditing] = useState(false);

  // Sync with external overrides
  useEffect(() => {
    if (userOverrides) {
      setUserRetail(userOverrides.retailPrice || aiRetail);
      setUserLanded(userOverrides.landedCost || aiLanded);
      setUserMOQ(userOverrides.moq || aiMOQ);
    }
  }, [userOverrides, aiRetail, aiLanded, aiMOQ]);

  // Calculated values
  const userMarginPct = userRetail > 0 ? ((userRetail - userLanded) / userRetail) * 100 : 0;
  const userProfitPerUnit = userRetail - userLanded;
  const userTotalProfit = userProfitPerUnit * userMOQ;
  const userFirstBatchCost = userLanded * userMOQ;

  // Check if user has made changes
  const hasChanges =
    userRetail !== aiRetail ||
    userLanded !== aiLanded ||
    userMOQ !== aiMOQ;

  function handleSave() {
    if (onUpdateOverrides) {
      onUpdateOverrides({
        retailPrice: userRetail,
        landedCost: userLanded,
        moq: userMOQ,
        grossMarginPct: userMarginPct,
        grossProfitTotal: userTotalProfit,
        firstBatchCost: userFirstBatchCost,
      });
    }
    setIsEditing(false);
  }

  function handleReset() {
    setUserRetail(aiRetail);
    setUserLanded(aiLanded);
    setUserMOQ(aiMOQ);
    if (onUpdateOverrides) {
      onUpdateOverrides({});
    }
  }

  const exWorks = financials.unitEconomics?.exWorksCost;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          💸 Financial Feasibility
        </h3>
        <div className="flex items-center gap-2">
          {financials.complexityTier && (
            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-white shadow-sm">
              {financials.complexityTier}
            </span>
          )}
          {!isEditing && onUpdateOverrides && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              📊 Model Your Scenario
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* LEFT: UNIT ECONOMICS */}
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-4">
            📦 Unit Economics (Per Item)
          </h4>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Factory Price (Ex-Works)</span>
              <span className="font-medium">{exWorks || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Est. Freight & Duty</span>
              <span className="font-medium">
                {financials.unitEconomics?.freightCost ? `+ ${financials.unitEconomics.freightCost}` : '+ TBD'}
              </span>
            </div>

            <div className="h-px bg-emerald-200 w-full my-2" />

            {/* Landed Cost - editable in edit mode */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Landed Cost</span>
                {!isEditing ? (
                  <span>{formatDollar(userLanded)}</span>
                ) : (
                  <span className="text-sky-600">{formatDollar(userLanded)}</span>
                )}
              </div>
              {isEditing && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={aiLanded * 0.7}
                    max={aiLanded * 1.3}
                    step="0.5"
                    value={userLanded}
                    onChange={(e) => setUserLanded(parseFloat(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Min: {formatDollar(aiLanded * 0.7)}</span>
                    <span className="text-slate-600">AI: {formatDollar(aiLanded)}</span>
                    <span>Max: {formatDollar(aiLanded * 1.3)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Retail Price - editable in edit mode */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-slate-500">
                <span>Target Retail</span>
                {!isEditing ? (
                  <span>{formatDollar(userRetail)}</span>
                ) : (
                  <span className="text-sky-600 font-medium">{formatDollar(userRetail)}</span>
                )}
              </div>
              {isEditing && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={aiRetail * 0.5}
                    max={aiRetail * 2}
                    step="1"
                    value={userRetail}
                    onChange={(e) => setUserRetail(parseFloat(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Min: {formatDollar(aiRetail * 0.5)}</span>
                    <span className="text-slate-600">AI: {formatDollar(aiRetail)}</span>
                    <span>Max: {formatDollar(aiRetail * 2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg p-3 border border-emerald-100 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-emerald-800 uppercase">Gross Margin</span>
            <div className="text-right">
              <span className={`text-lg font-bold ${hasChanges && isEditing ? 'text-sky-600' : 'text-emerald-600'}`}>
                {userMarginPct.toFixed(1)}%
              </span>
              {hasChanges && !isEditing && (
                <div className="text-[10px] text-slate-400">AI: {aiMargin}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: STARTUP CAPITAL */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col h-full">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            🚀 Startup Capital (NRE)
          </h4>

          <div className="space-y-3 text-sm flex-1">
            <div className="flex justify-between text-slate-600">
              <span>R&D & Prototyping</span>
              <span className="font-medium">{financials.startupCapital?.prototyping || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tooling & Molds</span>
              <span className="font-medium text-amber-600">{financials.startupCapital?.tooling || '-'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Certifications</span>
              <span className="font-medium">{financials.startupCapital?.certification || '-'}</span>
            </div>

            {/* First Batch - shows recalculated value */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>First Inventory Batch</span>
                <span className={`font-medium ${hasChanges && isEditing ? 'text-sky-600' : ''}`}>
                  {formatDollar(userFirstBatchCost)}
                </span>
              </div>

              {/* MOQ Input */}
              {isEditing && (
                <div className="bg-slate-100 rounded-lg p-3 space-y-2">
                  <label className="text-xs text-slate-600 block">
                    Your MOQ (units)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={userMOQ}
                    onChange={(e) => setUserMOQ(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-slate-400">
                    AI suggested: {aiMOQ} units
                  </p>
                </div>
              )}

              {!isEditing && (financials.startupCapital?.moqBasis || financials.startupCapital?.industryStandardMOQ) && (
                <div className="bg-slate-100 rounded-lg p-2 mt-1 text-xs text-slate-500">
                  {financials.startupCapital?.moqBasis && (
                    <div className="flex justify-between">
                      <span>Based on MOQ:</span>
                      <span className="font-medium text-slate-700">
                        {hasChanges ? `${userMOQ} units` : financials.startupCapital.moqBasis}
                      </span>
                    </div>
                  )}
                  {financials.startupCapital?.industryStandardMOQ && (
                    <div className="flex justify-between mt-1">
                      <span>Industry Standard:</span>
                      <span className="font-medium text-slate-700">{financials.startupCapital.industryStandardMOQ}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-300 w-full my-2" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Launch Budget</span>
              <span className="text-lg font-bold text-slate-900">{financials.startupCapital?.totalLaunchBudget || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* YOUR SCENARIO BOX */}
      {hasChanges && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border-2 border-sky-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-sky-900 uppercase tracking-wider flex items-center gap-2">
                📊 Your Financial Model
              </h4>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-600 hover:text-slate-800"
                  >
                    Reset to AI
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-xs font-medium hover:bg-sky-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-sky-700 mb-1">MOQ</p>
                <p className="text-lg font-bold text-sky-900">{userMOQ.toLocaleString()} units</p>
                <p className="text-xs text-slate-500">AI: {aiMOQ} units</p>
              </div>
              <div>
                <p className="text-xs text-sky-700 mb-1">Profit per Unit</p>
                <p className="text-lg font-bold text-sky-900">{formatDollar(userProfitPerUnit)}</p>
                <p className="text-xs text-slate-500">Margin: {userMarginPct.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-sky-700 mb-1">Total Profit on Batch</p>
                <p className="text-lg font-bold text-emerald-600">{formatDollar(userTotalProfit)}</p>
                <p className="text-xs text-slate-500">First batch cost: {formatDollar(userFirstBatchCost)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN COSTS */}
      {financials.hiddenCosts && financials.hiddenCosts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">⚠️ Hidden Costs to Consider</p>
          <div className="flex flex-wrap gap-2">
            {financials.hiddenCosts.map((cost, idx) => (
              <span key={idx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100">
                {cost}
              </span>
            ))}
          </div>
        </div>
      )}

      {financials.logisticDetails?.dutyRate && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-400">
          <p>HS Code: <span className="text-slate-600">{financials.logisticDetails.tariffCode || 'TBD'}</span></p>
          <p>Duty Rate: <span className="text-slate-600">{financials.logisticDetails.dutyRate}</span></p>
        </div>
      )}

      {preview && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic text-center">
            Unit economics and startup budget are approximate in this preview. Full cost models and margin simulations unlock in your project.
          </p>
        </div>
      )}
    </section>
  );
}