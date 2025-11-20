// components/partners/PartnersPage.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PartnerCard, { Partner } from '@/components/partners/PartnerCard';
import PartnerFilters from '@/components/partners/PartnerFilters';

type PartnersPageProps = {
  type: 'manufacturer' | 'agent' | 'shipper' | 'legal' | string;
  basePath: string; // e.g. "manufacturers"
  title: string;
  description: string;
  emptyMessage: string;
};

// === [1] GENERIC DIRECTORY PAGE FOR PARTNERS ===
export default function PartnersPage({
  type,
  basePath,
  title,
  description,
  emptyMessage,
}: PartnersPageProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'region'>('name');

  // === [1.1] LOAD PARTNERS FROM SUPABASE ===
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('partners')
          .select('*')
          .eq('type', type)
          .order('name', { ascending: true });

        if (dbError) {
          console.error(`Failed to load partners of type ${type}:`, dbError);
          setError(`Could not load ${title.toLowerCase()}.`);
          return;
        }

        setPartners((data || []) as Partner[]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [type, title]);

  // === [1.2] DERIVED FILTER OPTIONS ===
  const regionSet = new Set<string>();
  partners.forEach((p) => {
    const label = p.region || p.country || '';
    if (label) regionSet.add(label);
  });
  const regions = Array.from(regionSet).sort();

  const allTags = Array.from(
    new Set(
      partners
        .flatMap((p) => p.capabilities || [])
        .filter(Boolean) as string[]
    )
  ).sort();

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // === [1.3] APPLY FILTERS ===
  const filtered = partners.filter((p) => {
    const text = (
      p.name +
      ' ' +
      (p.description || '') +
      ' ' +
      (p.region || '') +
      ' ' +
      (p.country || '')
    ).toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;

    if (selectedRegion) {
      const regionLabel = p.region || p.country || '';
      if (regionLabel !== selectedRegion) return false;
    }

    if (selectedTags.length > 0) {
      const caps = (p.capabilities || []) as string[];
      const matchesTags = selectedTags.some((tag) => caps.includes(tag));
      if (!matchesTags) return false;
    }

    if (minRating) {
      const minimum = parseFloat(minRating);
      const rating = p.rating ?? 0;
      if (rating < minimum) return false;
    }

    return true;
  });

  // === [1.4] SORT RESULTS ===
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);

    if (sortBy === 'rating') {
      const ra = a.rating ?? 0;
      const rb = b.rating ?? 0;
      return rb - ra;
    }

    if (sortBy === 'region') {
      const la = (a.region || a.country || '').toLowerCase();
      const lb = (b.region || b.country || '').toLowerCase();
      return la.localeCompare(lb);
    }

    return 0;
  });

  // === [2] RENDER ===
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto pt-12 px-4 md:px-0 space-y-6">
        {/* HEADER */}
        <section>
          <h1 className="text-3xl font-semibold text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            {description}
          </p>
        </section>

        {/* FILTER BAR */}
        <PartnerFilters
          search={search}
          setSearch={setSearch}
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          minRating={minRating}
          setMinRating={setMinRating}
          sortBy={sortBy}
          setSortBy={(val) => setSortBy(val as 'name' | 'rating' | 'region')}
        />

        {/* RESULTS */}
        {loading ? (
          <p className="text-sm text-slate-500">
            Loading {title.toLowerCase()}…
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => (
              <PartnerCard key={p.id} partner={p} basePath={basePath} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}