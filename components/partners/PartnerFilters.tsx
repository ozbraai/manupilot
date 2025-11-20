// components/partners/PartnerFilters.tsx

'use client';

import React, { useMemo, useState } from 'react';

type PartnerFiltersProps = {
  search: string;
  setSearch: (value: string) => void;

  regions: string[];
  selectedRegion: string;
  setSelectedRegion: (value: string) => void;

  allTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;

  minRating: string;
  setMinRating: (value: string) => void;

  sortBy: string;
  setSortBy: (value: string) => void;
};

// === [1] HELPERS: classify capability tags into groups ===
function classifyTag(tag: string): string {
  const lower = tag.toLowerCase();

  if (
    lower.includes('electronic') ||
    lower.includes('battery') ||
    lower.includes('pcb') ||
    lower.includes('solder')
  ) {
    return 'Electronics';
  }

  if (
    lower.includes('assembly') ||
    lower.includes('packaging') ||
    lower.includes('quality') ||
    lower.includes('qc') ||
    lower.includes('control')
  ) {
    return 'Assembly & QA';
  }

  if (
    lower.includes('furniture') ||
    lower.includes('outdoor') ||
    lower.includes('oem') ||
    lower.includes('bag') ||
    lower.includes('gear')
  ) {
    return 'Product type';
  }

  if (
    lower.includes('molding') ||
    lower.includes('mould') ||
    lower.includes('metal') ||
    lower.includes('wood') ||
    lower.includes('machining') ||
    lower.includes('cutting') ||
    lower.includes('stamping') ||
    lower.includes('coating') ||
    lower.includes('bending') ||
    lower.includes('processing')
  ) {
    return 'Materials & processes';
  }

  return 'Other';
}

export default function PartnerFilters({
  search,
  setSearch,
  regions,
  selectedRegion,
  setSelectedRegion,
  allTags,
  selectedTags,
  toggleTag,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
}: PartnerFiltersProps) {
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    'region' | 'rating' | 'sort' | null
  >(null);

  const selectedTagsLabel =
    selectedTags.length === 0
      ? 'All capabilities'
      : `${selectedTags.length} selected`;

  // === [2] GROUP TAGS INTO BUCKETS ===
  const groupedTags = useMemo(() => {
    const groups: Record<string, string[]> = {
      'Materials & processes': [],
      'Product type': [],
      Electronics: [],
      'Assembly & QA': [],
      Other: [],
    };

    allTags.forEach((tag) => {
      const groupName = classifyTag(tag);
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(tag);
    });

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort();
    });

    return groups;
  }, [allTags]);

  // Helpers to show selected label text
  const regionLabel =
    selectedRegion || 'All regions';

  const ratingLabel =
    minRating === ''
      ? 'Any'
      : minRating === '4.0'
      ? '4.0★+'
      : minRating === '4.5'
      ? '4.5★+'
      : minRating === '4.8'
      ? '4.8★+'
      : 'Any';

  const sortLabel =
    sortBy === 'rating'
      ? 'Best rated'
      : sortBy === 'region'
      ? 'Region A–Z'
      : 'Name A–Z';

  function closeAllMenus() {
    setOpenMenu(null);
    setCapabilitiesOpen(false);
  }

  // === [3] RENDER ===
  return (
    <section className="flex flex-col gap-4 mb-4">
      {/* === [3.1] FIRST ROW – SEARCH + FILTER CHIPS === */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search manufacturers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Region chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === 'region' ? null : 'region')
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Region
              </span>
              <span>{regionLabel}</span>
              <span className="text-[10px] text-slate-500">
                {openMenu === 'region' ? '▲' : '▼'}
              </span>
            </button>

            {openMenu === 'region' && (
              <div className="absolute z-30 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion('');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  All regions
                </button>
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(region);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rating chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === 'rating' ? null : 'rating')
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Rating
              </span>
              <span>{ratingLabel}</span>
              <span className="text-[10px] text-slate-500">
                {openMenu === 'rating' ? '▲' : '▼'}
              </span>
            </button>

            {openMenu === 'rating' && (
              <div className="absolute z-30 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMinRating('');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  Any
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinRating('4.0');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  4.0 ★ and up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinRating('4.5');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  4.5 ★ and up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMinRating('4.8');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  4.8 ★ and up
                </button>
              </div>
            )}
          </div>

          {/* Sort chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenu(openMenu === 'sort' ? null : 'sort')
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Sort
              </span>
              <span>{sortLabel}</span>
              <span className="text-[10px] text-slate-500">
                {openMenu === 'sort' ? '▲' : '▼'}
              </span>
            </button>

            {openMenu === 'sort' && (
              <div className="absolute z-30 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  Name A–Z
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('rating');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  Best rated
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('region');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  Region A–Z
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === [3.2] SECOND ROW – CAPABILITIES BUTTON === */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-slate-500 uppercase tracking-[0.18em]">
          Capabilities
        </span>

        <button
          type="button"
          onClick={() => {
            closeAllMenus();
            setCapabilitiesOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          {selectedTagsLabel}
          <span className="text-[10px] text-slate-500">▼</span>
        </button>

        <span className="text-[11px] text-slate-500">
          Filter by what the manufacturer can do – processes, product category, or services.
        </span>
      </div>

      {/* === [3.3] CAPABILITIES OVERLAY PANEL === */}
      {capabilitiesOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/40 pt-24">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Capabilities
                </p>
                <p className="text-sm text-slate-700">
                  Tick all relevant capabilities. You can select multiple.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  selectedTags.forEach((tag) => toggleTag(tag));
                }}
                className="text-[11px] text-sky-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Panel body */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {allTags.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No capability tags available yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-xs">
                  {Object.entries(groupedTags).map(
                    ([groupName, tags]) =>
                      tags.length > 0 && (
                        <div key={groupName}>
                          <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                            {groupName}
                          </h4>
                          <div className="flex flex-col gap-1">
                            {tags.map((tag) => {
                              const active = selectedTags.includes(tag);
                              return (
                                <label
                                  key={tag}
                                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 rounded-md px-1 py-0.5"
                                >
                                  <input
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    checked={active}
                                    onChange={() => toggleTag(tag)}
                                  />
                                  <span>{tag}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCapabilitiesOpen(false)}
                className="px-4 py-1.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}