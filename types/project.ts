// types/project.ts

import type { PlaybookSnapshot } from './playbook';

// Component analysis for deep understanding
export type ComponentAnalysis = {
    name: string;
    material_specification: string;
    supplier_type: string;
    complexity_level: 'low' | 'medium' | 'high';
    lead_time_estimate: string;
    notes?: string;
};

// BOM (Bill of Materials) item
export type BOMItem = {
    part_number?: string;
    description: string;
    quantity: number;
    unit_cost_estimate?: string;
    supplier_type: string;
    notes?: string;
};

// Certification requirements
export type CertificationRequirement = {
    name: string; // e.g., "FCC", "CE", "UL"
    required_for_markets: string[]; // e.g., ["USA", "EU"]
    approximate_cost: string;
    timeline_to_obtain: string;
    testing_requirements: string[];
    priority: 'critical' | 'recommended' | 'optional';
};

// Compliance tracking
export type ComplianceItem = {
    regulation: string;
    market: string;
    status: 'required' | 'recommended' | 'not_applicable';
    action_items: string[];
};

// Supplier lead for shortlist
export type SupplierLead = {
    type: string; // e.g., "Injection Molding Factory"
    recommended_regions: string[];
    approach: string; // How to contact/vet them
    typical_moq: string;
    what_to_ask: string[];
};

// QC inspection point
export type QCItem = {
    inspection_point: string;
    what_to_check: string;
    acceptance_criteria: string;
    when_to_check: 'pre-production' | 'during-production' | 'final-inspection';
    importance: 'critical' | 'major' | 'minor';
};

// Technical decision point
export type TechnicalDecision = {
    decision_point: string;
    options: string[];
    recommendation: string;
    impact_if_wrong: string;
    when_to_decide: string;
};

// Risk analysis
export type RiskAnalysis = {
    business_risks: {
        risk: string;
        likelihood: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
        mitigation: string;
    }[];
    manufacturing_risks: {
        risk: string;
        likelihood: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
        mitigation: string;
    }[];
};

// Founder coaching/guidance
export type CoachingItem = {
    topic: string;
    guidance: string;
    common_mistakes: string[];
    best_practices: string[];
};

// Roadmap phase with dependencies
export type RoadmapPhase = {
    phase_number: number;
    name: string;
    description: string;
    duration_estimate: string;
    key_activities: string[];
    dependencies: number[]; // Phase numbers this depends on
    on_critical_path: boolean;
    deliverables: string[];
};

// Financial modeling
export type FinancialModel = {
    break_even_units: number;
    break_even_explanation: string;
    profit_scenarios: {
        units_sold: number;
        total_revenue: string;
        total_cost: string;
        net_profit: string;
        roi_percentage: string;
    }[];
};

// Deep AI Analysis - the comprehensive intelligence generated from snapshot
export type ProjectAIAnalysis = {
    // Opportunity assessment
    opportunity_score: number; // 0-100
    opportunity_rationale: string;
    what_you_might_not_know: string[];

    // Information gaps
    missing_info_scanner: string[];

    // Technical breakdown
    component_breakdown: ComponentAnalysis[];
    bom_draft: BOMItem[];

    // Regulatory & compliance
    certifications: CertificationRequirement[];
    compliance_map: ComplianceItem[];

    // Intellectual property
    ip_strategy: {
        patentability_signals: string[];
        copycat_risk: 'low' | 'medium' | 'high';
        copycat_risk_explanation: string;
        protection_recommendations: string[];
    };

    // Supply chain
    supplier_analysis: {
        types_required: string[];
        shortlist: SupplierLead[];
        red_flags: string[];
        sourcing_tips: string[];
    };

    // Quality
    quality_assurance: {
        qc_checklist: QCItem[];
        sample_to_production_risks: string[];
        inspection_strategy: string;
    };

    // Decisions & planning
    technical_decisions: TechnicalDecision[];
    risk_map: RiskAnalysis;
    founder_coaching: CoachingItem[];

    // Timeline & roadmap
    detailed_roadmap: RoadmapPhase[];

    // Financial modeling
    break_even_analysis: FinancialModel;

    // Metadata
    generated_at: string;
    model_version: string;
};

// Main Project type
export type Project = {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    category?: string;
    image_url?: string;

    // NEW: Frozen playbook state that created this project
    playbook_snapshot: PlaybookSnapshot;

    // NEW: Deep AI-generated manufacturing intelligence
    ai_analysis: ProjectAIAnalysis;

    // Existing fields (for backward compatibility)
    feasibility?: any;
    commercials?: any;
    product_style?: string;
    uniqueness?: string;

    // Timestamps
    created_at: string;
    updated_at: string;
};
