// types/playbook.ts

export type SourcingMode = 'white_label' | 'custom' | 'auto';

export type SubProductRole = 'core' | 'accessory' | 'packaging' | 'documentation';

export type SubProduct = {
  id: string;
  label: string;
  role: SubProductRole;
  description?: string;
};

export type ComponentsInfo = {
  coreProduct: string;
  category: string;
  subProducts: SubProduct[];
  components: Record<string, string[]>; // key: 'core' or subProduct.id
  supplierTypes: string[];
  whiteLabelSuitability?: {
    score: number;
    reason: string;
    typicalChanges?: string[];
    examples?: string[];
  };
};

export type Constraints = {
  targetUnitPrice?: string;
  maxUnitPrice?: string;
  moq?: string;
  launchWindow?: string;
  markets?: string;
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
  timeline: string[];
  nextSteps: string[];
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
  premium?: any;
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
