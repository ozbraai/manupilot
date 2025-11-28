// lib/feasibility.ts

/**
 * ManuPilot – Feasibility scoring engine
 *
 * This module converts AI-generated FeasibilityFeatures into
 * deterministic FeasibilityScores for use in the UI and database.
 *
 * It is intentionally pure and stateless so it can be used in:
 * - API routes (eg /api/playbook)
 * - Server components
 * - Future background jobs
 */

/* -----------------------
 *  Type definitions
 * ----------------------*/

export type CostBand = "Low" | "Medium" | "High";
export type ToolingBand = "None" | "Low" | "Medium" | "High";
export type WeightClass = "Light" | "Medium" | "Heavy";
export type FragilityBand = "Low" | "Medium" | "High";
export type ComplianceLevel = "Basic" | "Moderate" | "Strict";

export type ManufacturingProcess =
  | "sheet_metal"
  | "welding"
  | "cnc"
  | "injection_moulding"
  | "casting"
  | "forging"
  | "textile_sewing"
  | "electronics_pcba"
  | "assembly_only";

export type CompetitionCategory = "Commodity" | "Brandable" | "Niche";
export type SaturationBand = "Low" | "Medium" | "High";
export type DifferentiationBand = "Low" | "Medium" | "High";
export type TrendDirection = "Declining" | "Flat" | "Growing" | "Exploding";
export type MarketMaturity = "New" | "Emerging" | "Established" | "Saturated";
export type UniquenessFactor =
  | "branding_only"
  | "light_improvements"
  | "moderate_innovation"
  | "highly_unique"
  | "category_creating";

export type RegionSuitability = {
  region: string;
  suitability: number; // 0 - 100
  notes: string;
};

export type FeasibilityFeatures = {
  productCategory: string;

  processes: ManufacturingProcess[];
  partsCount: number;

  hasElectronics: boolean;
  requiresCustomTooling: boolean;
  toolingCostBand: ToolingBand;

  unitCostBand: CostBand;
  moqBand: CostBand;

  weightClass: WeightClass;
  fragility: FragilityBand;

  complianceLevel: ComplianceLevel;

  typicalRegions: RegionSuitability[];

  competitionCategory: CompetitionCategory;
  amazonSaturation: SaturationBand;
  differentiationDifficulty: DifferentiationBand;

  trendDirection: TrendDirection;
  marketMaturity: MarketMaturity;
  sourcingMode?: "white-label" | "combination" | "custom" | "auto";
  uniquenessFactor?: UniquenessFactor; // NEW FIELD
};

export type ManufacturabilityBlock = {
  score: number; // 0 - 100, higher = easier to manufacture
  manufacturabilityLabel: "Low" | "Medium" | "High"; // Renamed from complexityLabel
  notes: string[];
};

export type CostStructureBlock = {
  score: number; // 0 - 100, higher = more favourable
  unitCostBand: CostBand;
  moqBand: CostBand;
  toolingCostBand: ToolingBand;
  freightCostBand: WeightClass;
  notes: string[];
};

export type CompetitionBlock = {
  intensityScore: number; // 0 - 100, higher = more fierce competition
  advantageScore: number; // 0 - 100, higher = more room for differentiation
  intensityLabel: "Low" | "Medium" | "High" | "Extreme";
  notes: string[];
};

export type MarketBlock = {
  momentumScore: number; // 0 - 100, higher = better trend
  trendLabel: TrendDirection;
  notes: string[];
};

export type RiskBlock = {
  riskScore: number; // 0 - 100, higher = more risk
  riskLabel: "Low" | "Medium" | "High";
  notes: string[];
};

export type RegionsBlock = {
  mainRegion: string | null;
  alternatives: RegionSuitability[];
};

export type FeasibilityMeta = {
  version: string;
  generatedAt: string; // ISO
};

export type FeasibilityScores = {
  overallScore: number;

  manufacturability: ManufacturabilityBlock;
  costStructure: CostStructureBlock;
  competition: CompetitionBlock;
  market: MarketBlock;
  risk: RiskBlock;
  regions: RegionsBlock;

  meta: FeasibilityMeta;
};

/* -----------------------
 *  Helper functions
 * ----------------------*/

const clamp = (value: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, value));

const bandScore = {
  // Good if low, used for cost, MOQ etc
  lowIsGood: (band: CostBand): number => {
    if (band === "Low") return 90;
    if (band === "Medium") return 70;
    return 45; // High
  },

  // Good if high, not currently used but kept for future
  highIsGood: (band: CostBand): number => {
    if (band === "High") return 90;
    if (band === "Medium") return 70;
    return 45; // Low
  }
};

const trendScore = (dir: TrendDirection): number => {
  switch (dir) {
    case "Declining":
      return 30;
    case "Flat":
      return 50;
    case "Growing":
      return 75;
    case "Exploding":
      return 90;
    default:
      return 50;
  }
};

const fragilityRisk = (frag: FragilityBand): number => {
  if (frag === "Low") return 20;
  if (frag === "Medium") return 50;
  return 80; // High
};

const processBaseScore = (processes: ManufacturingProcess[]): number => {
  if (!processes || processes.length === 0) {
    // Neutral default
    return 70;
  }

  const map: Record<ManufacturingProcess, number> = {
    sheet_metal: 85,
    welding: 80,
    cnc: 75,
    injection_moulding: 65,
    casting: 70,
    forging: 70,
    textile_sewing: 85,
    electronics_pcba: 55,
    assembly_only: 90
  };

  const scores = processes.map((p) => map[p] ?? 70);
  return Math.min(...scores);
};

const partsComplexityPenalty = (partsCount: number): number => {
  if (partsCount <= 0) return 0;
  if (partsCount <= 5) return 0;
  if (partsCount <= 15) return 5;
  if (partsCount <= 30) return 10;
  return 20;
};

const weightFreightScore = (weight: WeightClass): number => {
  switch (weight) {
    case "Light":
      return 90;
    case "Medium":
      return 70;
    case "Heavy":
      return 45;
    default:
      return 70;
  }
};

const toolingScore = (band: ToolingBand): number => {
  switch (band) {
    case "None":
      return 95;
    case "Low":
      return 80;
    case "Medium":
      return 65;
    case "High":
      return 40;
    default:
      return 65;
  }
};

const manufacturabilityLabelFromScore = (
  score: number
): ManufacturabilityBlock["manufacturabilityLabel"] => {
  if (score >= 75) return "High"; // Easy to manufacture
  if (score >= 50) return "Medium";
  return "Low"; // Hard to manufacture
};

const competitionLabelFromScore = (
  score: number
): CompetitionBlock["intensityLabel"] => {
  if (score < 35) return "Low";
  if (score < 60) return "Medium";
  if (score < 80) return "High";
  return "Extreme";
};

const riskLabelFromScore = (score: number): RiskBlock["riskLabel"] => {
  if (score < 35) return "Low";
  if (score < 70) return "Medium";
  return "High";
};

/* -----------------------
 *  Block calculators
 * ----------------------*/

const calculateManufacturability = (f: FeasibilityFeatures): ManufacturabilityBlock => {
  // SOURCING MODE OVERRIDE
  if (f.sourcingMode === "white-label" || f.uniquenessFactor === "branding_only") {
    return {
      score: 95,
      manufacturabilityLabel: "High",
      notes: [
        "White Label / Branding Only: Already manufactured and available.",
        "No custom tooling or engineering required.",
        "Immediate availability from suppliers."
      ]
    };
  }

  let score = processBaseScore(f.processes);

  // Combination mode bonus (easier than full custom)
  if (f.sourcingMode === "combination" || f.uniquenessFactor === "light_improvements") {
    score += 10;
  }

  // Uniqueness Factor Impact
  if (f.uniquenessFactor === "highly_unique") {
    score -= 10;
  } else if (f.uniquenessFactor === "category_creating") {
    score -= 20;
  }

  // Tooling penalty
  if (f.requiresCustomTooling) {
    const toolingPenaltyMap: Record<ToolingBand, number> = {
      None: 0,
      Low: 5,
      Medium: 10,
      High: 20
    };
    score -= toolingPenaltyMap[f.toolingCostBand];
  }

  // Electronics penalty
  if (f.hasElectronics) {
    score -= 10;
  }

  // Compliance penalty
  const compliancePenaltyMap: Record<ComplianceLevel, number> = {
    Basic: 0,
    Moderate: 8,
    Strict: 18
  };
  score -= compliancePenaltyMap[f.complianceLevel];

  // Parts penalty
  score -= partsComplexityPenalty(f.partsCount);

  const finalScore = clamp(score);

  const notes: string[] = [];

  if (f.sourcingMode === "combination") {
    notes.push("Combination approach: Uses standard parts with some custom modification.");
  }

  if (f.uniquenessFactor === "category_creating") {
    notes.push("Category-creating product: Requires fresh engineering approach.");
  }

  if (finalScore >= 75) {
    notes.push("Standard manufacturing processes, easy to scale.");
  } else if (finalScore >= 50) {
    notes.push("Moderate complexity, requires experienced manufacturer.");
  } else {
    notes.push("Complex manufacturing, likely requires custom engineering and multiple suppliers.");
  }

  if (f.requiresCustomTooling) {
    notes.push("Requires custom tooling or moulds.");
  }

  if (f.hasElectronics) {
    notes.push("Includes electronic components, which adds complexity.");
  }

  return {
    score: finalScore,
    manufacturabilityLabel: manufacturabilityLabelFromScore(finalScore),
    notes
  };
};

const calculateCostStructure = (f: FeasibilityFeatures): CostStructureBlock => {
  const unitCost = bandScore.lowIsGood(f.unitCostBand);
  const moq = bandScore.lowIsGood(f.moqBand);
  const tooling = toolingScore(f.toolingCostBand);
  const freight = weightFreightScore(f.weightClass);

  const rawScore =
    0.35 * unitCost +
    0.25 * moq +
    0.20 * tooling +
    0.20 * freight;

  const score = Math.round(rawScore);

  const notes: string[] = [];

  if (f.unitCostBand === "Low") {
    notes.push("Favourable unit cost band for healthy margins.");
  } else if (f.unitCostBand === "High") {
    notes.push("High unit cost band, consider premium positioning or cost reduction.");
  }

  if (f.moqBand === "High") {
    notes.push("High minimum order quantities likely required by suppliers.");
  }

  if (f.toolingCostBand === "High") {
    notes.push("Expect significant upfront tooling or mould costs.");
  } else if (f.toolingCostBand === "None") {
    notes.push("No significant tooling costs expected.");
  }

  if (f.weightClass === "Heavy") {
    notes.push("Heavy product class, freight costs will be a major factor.");
  }

  return {
    score,
    unitCostBand: f.unitCostBand,
    moqBand: f.moqBand,
    toolingCostBand: f.toolingCostBand,
    freightCostBand: f.weightClass,
    notes
  };
};

const calculateCompetition = (f: FeasibilityFeatures): CompetitionBlock => {
  let score = 0;

  // SOURCING MODE & UNIQUENESS IMPACT
  if (f.sourcingMode === "white-label" || f.uniquenessFactor === "branding_only") {
    // White label implies higher competition (commodity)
    score += 80;
  } else if (f.sourcingMode === "custom" || f.uniquenessFactor === "highly_unique") {
    // Custom implies lower competition (niche)
    score += 20;
  } else if (f.uniquenessFactor === "category_creating") {
    // Category creating implies unknown/low direct competition
    score += 10;
  } else {
    // Default logic if no mode or combination
    const baseMap: Record<CompetitionCategory, number> = {
      Commodity: 80,
      Brandable: 60,
      Niche: 20
    };
    score += baseMap[f.competitionCategory];
  }

  const satMap: Record<SaturationBand, number> = {
    Low: -10,
    Medium: 0,
    High: 10
  };
  score += satMap[f.amazonSaturation];

  const diffMap: Record<DifferentiationBand, number> = {
    Low: -10,
    Medium: 0,
    High: 10
  };
  score += diffMap[f.differentiationDifficulty];

  const intensityScore = clamp(score);
  const advantageScore = clamp(100 - intensityScore);
  const intensityLabel = competitionLabelFromScore(intensityScore);

  const notes: string[] = [];

  if (f.uniquenessFactor === "branding_only") {
    notes.push("Branding-Only: High competition, differentiation relies solely on brand.");
  } else if (f.uniquenessFactor === "category_creating") {
    notes.push("Category-Creating: No direct competitors, but requires market education.");
  } else if (f.sourcingMode === "white-label") {
    notes.push("White Label: High competition as product is widely available.");
  } else if (f.sourcingMode === "custom") {
    notes.push("Custom Design: Low direct competition due to uniqueness.");
  } else if (f.competitionCategory === "Commodity") {
    notes.push("Highly commoditised category, expect many similar products.");
  } else if (f.competitionCategory === "Brandable") {
    notes.push("Category allows differentiation through brand and design.");
  } else {
    notes.push("Niche category, more focused competition.");
  }

  if (f.amazonSaturation === "High") {
    notes.push("High marketplace saturation, expect price pressure.");
  } else if (f.amazonSaturation === "Low") {
    notes.push("Relatively low marketplace saturation, more room to stand out.");
  }

  return {
    intensityScore,
    advantageScore,
    intensityLabel,
    notes
  };
};

const calculateMarket = (f: FeasibilityFeatures): MarketBlock => {
  const score = trendScore(f.trendDirection);

  const notes: string[] = [];

  if (f.trendDirection === "Exploding") {
    notes.push("Rapidly growing category, strong demand momentum.");
  } else if (f.trendDirection === "Growing") {
    notes.push("Growing category with positive demand trend.");
  } else if (f.trendDirection === "Flat") {
    notes.push("Stable category with consistent demand.");
  } else {
    notes.push("Declining category, validate demand carefully.");
  }

  return {
    momentumScore: score,
    trendLabel: f.trendDirection,
    notes
  };
};

const calculateRisk = (f: FeasibilityFeatures): RiskBlock => {
  let score = 0;

  score += fragilityRisk(f.fragility);

  if (f.hasElectronics) {
    score += 10;
  }

  const complianceRiskMap: Record<ComplianceLevel, number> = {
    Basic: 10,
    Moderate: 30,
    Strict: 60
  };
  score += (complianceRiskMap[f.complianceLevel] ?? 30);

  // Market Maturity Risk
  const marketRiskMap: Record<MarketMaturity, number> = {
    New: 40, // High risk because it's untested
    Emerging: 20,
    Established: 0,
    Saturated: 10 // Risk of competition
  };
  score += (marketRiskMap[f.marketMaturity] ?? 20);

  // Uniqueness Risk
  if (f.uniquenessFactor === "branding_only") {
    score -= 20; // Low risk
  } else if (f.uniquenessFactor === "highly_unique") {
    score += 10; // Higher technical risk
  } else if (f.uniquenessFactor === "category_creating") {
    score += 30; // High market risk
  }

  if (f.weightClass === "Heavy") {
    score += 15;
  } else if (f.weightClass === "Medium") {
    score += 5;
  }

  const finalScore = clamp(score);
  const label = riskLabelFromScore(finalScore);

  const notes: string[] = [];

  if (f.uniquenessFactor === "branding_only") {
    notes.push("Low technical risk (Branding Only).");
  } else if (f.uniquenessFactor === "category_creating") {
    notes.push("High market risk (Category Creating): Unknown adoption.");
  }

  if (f.marketMaturity === "New") {
    notes.push("New/Untested market: High risk of product-market fit.");
  } else if (f.marketMaturity === "Emerging") {
    notes.push("Emerging market: Adds moderate market risk.");
  }

  if (f.fragility === "High") {
    notes.push("High fragility: High risk of damage in transit.");
  }

  if (f.hasElectronics) {
    notes.push("Electronics: Increases failure risk and QC complexity.");
  }

  if (f.complianceLevel === "Strict") {
    notes.push("Strict compliance: High regulatory and testing risk.");
  }

  return {
    riskScore: finalScore,
    riskLabel: label,
    notes
  };
};

const calculateRegions = (f: FeasibilityFeatures): RegionsBlock => {
  if (!f.typicalRegions || f.typicalRegions.length === 0) {
    return {
      mainRegion: null,
      alternatives: []
    };
  }

  const sorted = [...f.typicalRegions].sort(
    (a, b) => b.suitability - a.suitability
  );
  const [main, ...rest] = sorted;

  return {
    mainRegion: main.region,
    alternatives: rest.slice(0, 3)
  };
};

const calculateOverallScore = (blocks: {
  manufacturabilityScore: number;
  costStructureScore: number;
  advantageScore: number;
  momentumScore: number;
  riskScore: number;
}): number => {
  const {
    manufacturabilityScore,
    costStructureScore,
    advantageScore,
    momentumScore,
    riskScore
  } = blocks;

  const riskAdjusted = 100 - riskScore;

  const raw =
    0.35 * manufacturabilityScore +
    0.25 * costStructureScore +
    0.20 * advantageScore +
    0.10 * momentumScore +
    0.10 * riskAdjusted;

  return clamp(Math.round(raw));
};

/* -----------------------
 *  Public API
 * ----------------------*/

/**
 * Main entry point:
 * Convert FeasibilityFeatures (from AI) into FeasibilityScores.
 */
export function calculateFeasibility(
  features: FeasibilityFeatures
): FeasibilityScores {
  const manufacturability = calculateManufacturability(features);
  const costStructure = calculateCostStructure(features);
  const competition = calculateCompetition(features);
  const market = calculateMarket(features);
  const risk = calculateRisk(features);
  const regions = calculateRegions(features);

  const overallScore = calculateOverallScore({
    manufacturabilityScore: manufacturability.score,
    costStructureScore: costStructure.score,
    advantageScore: competition.advantageScore,
    momentumScore: market.momentumScore,
    riskScore: risk.riskScore
  });

  const meta: FeasibilityMeta = {
    version: "1.0",
    generatedAt: new Date().toISOString()
  };

  return {
    overallScore,
    manufacturability,
    costStructure,
    competition,
    market,
    risk,
    regions,
    meta
  };
}