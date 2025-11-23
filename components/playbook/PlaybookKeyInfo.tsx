'use client';

import React, { useState } from 'react';

type PlaybookKeyInfoProps = {
  targetCustomer?: string;
  manufacturingRegions?: string[];
  regionRationale?: string; // NEW FIELD
  onUpdate: (key: string, value: any) => void;
};

export default function PlaybookKeyInfo({ 
  targetCustomer = '', 
  manufacturingRegions = [], 
  regionRationale = '',
  onUpdate 
}: PlaybookKeyInfoProps) {
  
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [draftCustomer, setDraftCustomer] = useState(targetCustomer);

  const [editingRegion, setEditingRegion] = useState(false);
  const [draftRegionList, setDraftRegionList] = useState(manufacturingRegions.join(', '));
  const [draftRationale, setDraftRationale] = useState(regionRationale);

  function saveCustomer() {
    onUpdate('targetCustomer', draftCustomer);
    setEditingCustomer(false);
  }

  function saveRegion() {
    // Convert comma string back to array
    const regionArray = draftRegionList.split(',').map(s => s.trim()).filter(Boolean);
    onUpdate('manufacturingRegions', regionArray);
    onUpdate('regionRationale', draftRationale);
    setEditingRegion(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col gap-6">
      
      {/* === 1. TARGET CUSTOMER === */}
      <div>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">👤 Target Customer</h3>
            {!editingCustomer && (
                <button onClick={() => setEditingCustomer(true)} className="text-xs text-sky-600 hover:underline">Edit</button>
            )}
        </div>
        
        {editingCustomer ? (
            <div className="space-y-2">
                <textarea 
                    value={draftCustomer}
                    onChange={(e) => setDraftCustomer(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    rows={3}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingCustomer(false)} className="text-xs text-slate-500">Cancel</button>
                    <button onClick={saveCustomer} className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full">Save</button>
                </div>
            </div>
        ) : (
            <p className="text-sm text-slate-800 leading-relaxed">{targetCustomer || 'No target customer defined.'}</p>
        )}
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* === 2. MANUFACTURING REGION === */}
      <div>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">🌍 Manufacturing Hub</h3>
            {!editingRegion && (
                <button onClick={() => setEditingRegion(true)} className="text-xs text-sky-600 hover:underline">Edit</button>
            )}
        </div>

        {editingRegion ? (
             <div className="space-y-3">
                <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Regions (comma separated)</label>
                    <input 
                        type="text" 
                        value={draftRegionList}
                        onChange={(e) => setDraftRegionList(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Why this region?</label>
                    <textarea 
                        value={draftRationale}
                        onChange={(e) => setDraftRationale(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        rows={2}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingRegion(false)} className="text-xs text-slate-500">Cancel</button>
                    <button onClick={saveRegion} className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full">Save</button>
                </div>
            </div>
        ) : (
            <div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {manufacturingRegions.map((r, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {r}
                        </span>
                    ))}
                </div>
                {regionRationale && (
                    <p className="text-xs text-slate-500 italic">
                        "{regionRationale}"
                    </p>
                )}
            </div>
        )}
      </div>

    </section>
  );
}