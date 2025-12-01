import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { PlaybookSnapshot } from '@/types/playbook';
import type { ProjectAIAnalysis } from '@/types/project';
import type { FeasibilityScores } from '@/lib/feasibility';

export interface LoadedProject {
    id: string;
    title: string;
    description: string;
    category: string;
    created_at: string;

    // Core data sources
    playbook_snapshot: PlaybookSnapshot | null;
    ai_analysis: ProjectAIAnalysis | null;
    feasibility: FeasibilityScores | null;

    // Convenience accessors (derived from above)
    productName: string;
    summary: string;
    targetCustomer: string;
    sourcingMode: string;

    // Financials
    // Financials
    unitEconomics: {
        exWorksCost?: string;
        freightCost?: string;
        landedCost?: string;
        retailPrice?: string;
        grossMargin?: string;
    } | null;

    startupCapital: {
        tooling?: string;
        prototyping?: string;
        certification?: string;
        firstBatchCost?: string;
        totalLaunchBudget?: string;
        moqBasis?: string;
        industryStandardMOQ?: string;
    } | null;

    // From AI Analysis
    components: ProjectAIAnalysis['component_breakdown'] | [];
    bom: ProjectAIAnalysis['bom_draft'] | [];
    certifications: ProjectAIAnalysis['certifications'] | [];
    qcChecklist: ProjectAIAnalysis['quality_assurance']['qc_checklist'] | [];
    supplierAnalysis: ProjectAIAnalysis['supplier_analysis'] | null;
    riskMap: ProjectAIAnalysis['risk_map'] | null;
    ipStrategy: ProjectAIAnalysis['ip_strategy'] | null;
    roadmap: ProjectAIAnalysis['detailed_roadmap'] | [];
    founderCoaching: ProjectAIAnalysis['founder_coaching'] | [];
    breakEvenAnalysis: ProjectAIAnalysis['break_even_analysis'] | null;
    whatYouMightNotKnow: string[];
    missingInfo: string[];
    opportunityScore: number | null;

    // Progress Tracking
    specs_confirmed_at?: string | null;
    selected_supplier_id?: string | null;
    rfqs?: { sentAt: string | null }[];
    quotes?: { receivedAt: string | null }[];
    samples?: {
        requestedAt: string | null;
        receivedAt: string | null;
        status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
    }[];

    // User Targets (from DB)
    targetUnitCost?: number | null;
    targetRetailPrice?: number | null;
    targetMOQ?: number | null;
}

export async function loadProject(projectId: string): Promise<LoadedProject | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only in server component */ },
            },
        }
    );

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error || !project) {
        console.error('Failed to load project:', error?.message || error, error);
        return null;
    }

    const snapshot = project.playbook_snapshot as PlaybookSnapshot | null;
    const analysis = project.ai_analysis as ProjectAIAnalysis | null;
    const feasibility = project.feasibility as FeasibilityScores | null;

    // Build normalized project object
    return {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        created_at: project.created_at,

        // Raw data
        playbook_snapshot: snapshot,
        ai_analysis: analysis,
        feasibility: feasibility,

        // Convenience accessors
        productName: snapshot?.product_name || project.title,
        summary: snapshot?.final_edits?.summary || snapshot?.ai_baseline?.summary || project.description,
        targetCustomer: snapshot?.ai_baseline?.targetCustomer || '',
        sourcingMode: snapshot?.sourcing_mode || 'auto',

        // Financials
        unitEconomics: snapshot?.ai_baseline?.unitEconomics || null,
        startupCapital: snapshot?.ai_baseline?.startupCapital || null,

        // From AI Analysis (with fallbacks)
        components: analysis?.component_breakdown || [],
        bom: analysis?.bom_draft || [],
        certifications: analysis?.certifications || [],
        qcChecklist: analysis?.quality_assurance?.qc_checklist || [],
        supplierAnalysis: analysis?.supplier_analysis || null,
        riskMap: analysis?.risk_map || null,
        ipStrategy: analysis?.ip_strategy || null,
        roadmap: analysis?.detailed_roadmap || [],
        founderCoaching: analysis?.founder_coaching || [],
        breakEvenAnalysis: analysis?.break_even_analysis || null,
        whatYouMightNotKnow: analysis?.what_you_might_not_know || [],
        missingInfo: analysis?.missing_info_scanner || [],
        opportunityScore: analysis?.opportunity_score || null,

        // Progress Tracking
        specs_confirmed_at: project.specs_confirmed_at,
        selected_supplier_id: project.selected_supplier_id,
        rfqs: project.rfqs,
        quotes: project.quotes,
        samples: project.samples,

        // User Targets
        targetUnitCost: project.targetUnitCost,
        targetRetailPrice: project.targetRetailPrice,
        targetMOQ: project.targetMOQ,
    };
}
