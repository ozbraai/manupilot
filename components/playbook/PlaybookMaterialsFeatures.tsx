"use client";

import { useEffect, useState } from "react";

type LegacyFree = {
  materials?: string | string[];
  features?: string | string[];
};

type Props = {
  // New-style props
  materials?: string | string[];
  features?: string | string[];
  onUpdate?: (vals: { materials: string[]; features: string[] }) => void;

  // Legacy props (how playbook-summary currently calls it)
  free?: LegacyFree;
  onUpdateMaterials?: (materials: string[]) => void;
  onUpdateFeatures?: (features: string[]) => void;
};

export default function PlaybookMaterialsFeatures({
  materials,
  features,
  free,
  onUpdate,
  onUpdateMaterials,
  onUpdateFeatures,
}: Props) {
  // === HELPERS ===
  function arrayToLines(
    arr: string | string[] | undefined
  ): string {
    if (Array.isArray(arr)) return arr.join("\n");
    if (typeof arr === "string") return arr;
    return "";
  }

  function linesToArray(text: string): string[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  // Prefer values from `free` if provided, otherwise use direct props
  const initialMaterialsSource =
    free?.materials ?? materials;
  const initialFeaturesSource =
    free?.features ?? features;

  const [materialsText, setMaterialsText] = useState(
    arrayToLines(initialMaterialsSource)
  );
  const [featuresText, setFeaturesText] = useState(
    arrayToLines(initialFeaturesSource)
  );

  // Keep drafts in sync when parent changes
  useEffect(() => {
    setMaterialsText(
      arrayToLines(free?.materials ?? materials)
    );
  }, [free?.materials, materials]);

  useEffect(() => {
    setFeaturesText(
      arrayToLines(free?.features ?? features)
    );
  }, [free?.features, features]);

  function handleBlur() {
    const mats = linesToArray(materialsText);
    const feats = linesToArray(featuresText);

    // New unified callback
    if (onUpdate) {
      onUpdate({ materials: mats, features: feats });
    }

    // Legacy callbacks
    if (onUpdateMaterials) {
      onUpdateMaterials(mats);
    }
    if (onUpdateFeatures) {
      onUpdateFeatures(feats);
    }
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
          placeholder={
            "Example: Stainless steel 304\nHeat-resistant nylon handle\nFood-grade silicone feet"
          }
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
          placeholder={
            "Example: Compact folding design\nAdjustable airflow\nRotisserie mounting points"
          }
        />
      </div>
    </div>
  );
}