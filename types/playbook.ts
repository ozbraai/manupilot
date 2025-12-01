// types/playbook.ts

import type { UniquenessFactor } from '@/lib/feasibility';

export type SourcingMode = 'white-label' | 'custom' | 'combination' | 'dropshipping' | 'auto';

export type SubProductRole = 'core' | 'accessory' | 'packaging' | 'documentation';

export type SubProduct = {
  id: string;
  label: string;
  role: SubProductRole;
  description?: string;
};

export type ComponentsInfo = {
  coreProduct: string;
  coreProductSummary?: string;
  keyCharacteristics?: string[];
  category: string;
  subProducts: SubProduct[];
  components: Record<string, string[]>; // key: 'core' or subProduct.id
  supplierTypes: string[];
  whiteLabelSuitability?: {
    score: number;
    reason: string;
    typicalChanges?: string[];
    firstBatchCost?: string;
    totalLaunchBudget?: string;
    moqBasis?: string;
    industryStandardMOQ?: string;
    examples?: string[];
  };
};

export type Constraints = {
  targetUnitPrice?: string;
  maxUnitPrice?: string;
  moq?: string;
  launchWindow?: string;
  markets?: string;
  primaryMarket?: string;
  successDefinition?: string;
};

export type CostEstimate = {
  unitCostRange: string;
  moqRange: string;
  retailRange: string;
  packagingCostRange: string;
  notes: string;
};

export type ManufacturingApproach = {
  recommendedRegions: string[];
  rationale: string;
  risks: string[];
};

export type Pricing = {
  positioning: string;
  insight: string;
};

export type FreePlaybookContent = {
  summary: string;
  targetCustomer: string;
  keyFeatures: string[];
  materials: string[];
  manufacturingApproach: ManufacturingApproach;
  pricing: Pricing;
  financials?: any; // Added financials field
  timeline: string[];
  nextSteps: string[];
  sourcingMode?: SourcingMode;
};

export type PlaybookV2 = {
  productName: string;
  mode: SourcingMode;
  category: string;
  coreProduct: string;
  subProducts: SubProduct[];
  componentsInfo: ComponentsInfo;
  constraints: Constraints;
  costEstimate?: CostEstimate;
  free: FreePlaybookContent;
  feasibilitySnapshot?: FeasibilitySnapshot;
  premium?: any;
};

export type SimilarProduct = {
  id: string;
  title: string;
  imageUrl?: string;
  reason: string;
};

export type FeasibilitySnapshot = {
  category: string;
  complexity: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  estimatedUnitCostRange: string;
  estimatedMOQRange: string;
  estimatedTimelineRange: string;
  whiteLabelSuitability?: {
    score: number;
    reason: string;
  };
  patentRisk: 'low' | 'medium' | 'high';
  notes: string[];
};

export type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
  suggestedAnswer?: string;
};

export type Answers = Record<string, string>;

// User overrides for interactive financial modeling
export type PlaybookUserOverrides = {
  moq?: number;
  retailPrice?: number;
  landedCost?: number;
  // Calculated values (derived from above, stored for convenience)
  grossMarginPct?: number;
  grossProfitTotal?: number;
  firstBatchCost?: number;
};

// Original wizard input from step 1
export type WizardInput = {
  originalIdea: string;
  referenceLink?: string;
  referenceImage?: string;
  designStage?: string;
};

// Update PlaybookV2 with new fields
export type PlaybookV2WithOverrides = PlaybookV2 & {
  wizardInput?: WizardInput;
  userOverrides?: PlaybookUserOverrides;
};

// Final snapshot structure - frozen state for project creation
export type PlaybookSnapshot = {
  // Original AI baseline (never changes)
  ai_baseline: {
    summary?: string;
    targetCustomer?: string;
    keyFeatures?: string[];
    materials?: string[];
    dimensions?: string;
    weight?: string;
    colors?: string[];

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
    manufacturingApproach?: ManufacturingApproach;
    pricing?: Pricing;
    timeline?: string[];
    nextSteps?: string[];
    hiddenCosts?: string[];
  };

  // User's wizard input
  wizard_input: WizardInput;

  // User's financial tweaks
  user_overrides: PlaybookUserOverrides;

  // Final edits to summary, features, etc
  final_edits: {
    summary?: string;
    targetCustomer?: string;
    keyFeatures?: string[];
    materials?: string[];
  };

  // Feasibility snapshot
  feasibility?: FeasibilitySnapshot;

  // Commercials (Legacy/V2 support)
  costEstimate?: CostEstimate;
  constraints?: Constraints;

  // Metadata
  snapshot_date: string;
  product_name: string;
  category: string;
  sourcing_mode: SourcingMode;
  uniqueness_factor?: UniquenessFactor;
  differentiation_text?: string;
};
