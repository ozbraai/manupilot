"use client";

import { useEffect, useState } from "react";

type Props = {
  materials: string | string[] | undefined;
  features: string | string[] | undefined;
  onUpdate: (vals: { materials: string[]; features: string[] }) => void;
};

export default function PlaybookMaterialsFeatures({
  materials,
  features,
  onUpdate,
}: Props) {
  // === HELPERS ===
  function arrayToLines(arr: string | string[] | undefined): string {
    if (Array.isArray(arr)) return arr.join("\n");
    if (typeof arr === "string") return arr; // already a string
    return "";
  }

  function linesToArray(text: string): string[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const [materialsText, setMaterialsText] = useState(arrayToLines(materials));
  const [featuresText, setFeaturesText] = useState(arrayToLines(features));

  // Sync up if parent updates
  useEffect(() => {
    setMaterialsText(arrayToLines(materials));
  }, [materials]);

  useEffect(() => {
    setFeaturesText(arrayToLines(features));
  }, [features]);

  // Handle saves
  function handleBlur() {
    onUpdate({
      materials: linesToArray(materialsText),
      features: linesToArray(featuresText),
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Materials
        </p>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
          value={materialsText}
          onChange={(e) => setMaterialsText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Example: Stainless steel 304&#10;Heat-resistant nylon handle&#10;Food-grade silicone feet"
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Features
        </p>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Example: Compact folding design&#10;Adjustable airflow&#10;Rotisserie mounting points"
        />
      </div>
    </div>
  );
}