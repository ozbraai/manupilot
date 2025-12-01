import { Project, ProjectPhase } from '@/types/project';

export type MilestoneKey =
    | 'specs_confirmed'
    | 'cost_targets_set'
    | 'rfq_sent'
    | 'quote_received'
    | 'supplier_selected'
    | 'sample_requested'
    | 'sample_received'
    | 'sample_approved'
    | 'branding_finalized'
    | 'production_order_placed'
    | 'deposit_paid'
    | 'production_started'
    | 'qc_passed'
    | 'shipment_dispatched';

export interface Milestone {
    key: MilestoneKey;
    phase: ProjectPhase;
    label: string;
    points: number;
    detect: (project: Project) => boolean;
    waitingLabel?: string; // e.g., "Waiting for supplier response"
}

export interface ProgressResult {
    percentage: number;
    currentPhase: ProjectPhase;
    completedMilestones: MilestoneKey[];
    currentMilestone: MilestoneKey | null;
    nextMilestone: MilestoneKey | null;
    blockers: string[];
    phaseProgress: {
        phase: ProjectPhase;
        earned: number;
        total: number;
        milestones: {
            key: MilestoneKey;
            label: string;
            completed: boolean;
            waiting?: boolean;
            waitingLabel?: string;
        }[];
    }[];
}

export const MILESTONES: Milestone[] = [
    // PHASE 1: PLANNING (20 points)
    {
        key: 'specs_confirmed',
        phase: 'planning',
        label: 'Product specifications confirmed',
        points: 10,
        detect: (p) => {
            const hasMinimumSpecs =
                (p.specs?.materials?.length ?? 0) > 0 &&
                (p.specs?.features?.length ?? 0) > 0;
            const userConfirmed = p.specs_confirmed_at !== null && p.specs_confirmed_at !== undefined;
            return hasMinimumSpecs && userConfirmed;
        }
    },
    {
        key: 'cost_targets_set',
        phase: 'planning',
        label: 'Cost and pricing targets set',
        points: 10,
        detect: (p) => {
            return p.targetUnitCost !== null && p.targetUnitCost !== undefined &&
                p.targetRetailPrice !== null && p.targetRetailPrice !== undefined &&
                p.targetMOQ !== null && p.targetMOQ !== undefined;
        }
    },

    // PHASE 2: SUPPLIER SOURCING (25 points)
    {
        key: 'rfq_sent',
        phase: 'supplier_sourcing',
        label: 'RFQ sent to suppliers',
        points: 10,
        detect: (p) => p.rfqs?.some(r => r.sentAt !== null) ?? false,
        waitingLabel: 'Send your first RFQ to get quotes'
    },
    {
        key: 'quote_received',
        phase: 'supplier_sourcing',
        label: 'Quote received from supplier',
        points: 10,
        detect: (p) => p.quotes?.some(q => q.receivedAt !== null) ?? false,
        waitingLabel: 'Waiting for supplier responses'
    },
    {
        key: 'supplier_selected',
        phase: 'supplier_sourcing',
        label: 'Supplier selected',
        points: 5,
        detect: (p) => p.selected_supplier_id !== null && p.selected_supplier_id !== undefined
    },

    // PHASE 3: SAMPLING (25 points)
    {
        key: 'sample_requested',
        phase: 'sampling',
        label: 'Sample requested',
        points: 5,
        detect: (p) => p.samples?.some(s => s.requestedAt !== null) ?? false
    },
    {
        key: 'sample_received',
        phase: 'sampling',
        label: 'Sample received',
        points: 10,
        detect: (p) => p.samples?.some(s => s.receivedAt !== null) ?? false,
        waitingLabel: 'Sample in transit'
    },
    {
        key: 'sample_approved',
        phase: 'sampling',
        label: 'Sample approved',
        points: 10,
        detect: (p) => p.samples?.some(s => s.status === 'approved') ?? false
    },

    // PHASE 4: PRE-PRODUCTION (15 points)
    {
        key: 'branding_finalized',
        phase: 'pre_production',
        label: 'Branding and packaging finalized',
        points: 5,
        detect: (p) => {
            return (p.branding?.logoConfirmed ?? false) && (p.branding?.packagingConfirmed ?? false);
        }
    },
    {
        key: 'production_order_placed',
        phase: 'pre_production',
        label: 'Production order placed',
        points: 5,
        detect: (p) => (p.production_order?.placedAt ?? null) !== null
    },
    {
        key: 'deposit_paid',
        phase: 'pre_production',
        label: 'Deposit paid',
        points: 5,
        detect: (p) => (p.production_order?.depositPaidAt ?? null) !== null
    },

    // PHASE 5: PRODUCTION & DELIVERY (15 points)
    {
        key: 'production_started',
        phase: 'production',
        label: 'Production started',
        points: 5,
        detect: (p) => (p.production_order?.productionStartedAt ?? null) !== null
    },
    {
        key: 'qc_passed',
        phase: 'production',
        label: 'QC inspection passed',
        points: 5,
        detect: (p) => p.production_order?.qcStatus === 'passed'
    },
    {
        key: 'shipment_dispatched',
        phase: 'production',
        label: 'Shipment dispatched',
        points: 5,
        detect: (p) => (p.production_order?.shippedAt ?? null) !== null
    }
];

export const PHASE_CONFIG: Record<ProjectPhase, { label: string; order: number }> = {
    planning: { label: 'Planning', order: 1 },
    supplier_sourcing: { label: 'Supplier Sourcing', order: 2 },
    sampling: { label: 'Sampling', order: 3 },
    pre_production: { label: 'Pre-Production', order: 4 },
    production: { label: 'Production & Delivery', order: 5 },
    completed: { label: 'Completed', order: 6 }
};

export function calculateProgress(project: Project): ProgressResult {
    let totalEarned = 0;
    const completedMilestones: MilestoneKey[] = [];
    let currentMilestone: MilestoneKey | null = null;
    let nextMilestone: MilestoneKey | null = null;
    const blockers: string[] = [];

    // Group milestones by phase
    const phaseGroups = new Map<ProjectPhase, Milestone[]>();
    for (const m of MILESTONES) {
        if (!phaseGroups.has(m.phase)) {
            phaseGroups.set(m.phase, []);
        }
        phaseGroups.get(m.phase)!.push(m);
    }

    // Calculate per-phase progress
    const phaseProgress: ProgressResult['phaseProgress'] = [];

    // Ensure we iterate in order
    const orderedPhases: ProjectPhase[] = ['planning', 'supplier_sourcing', 'sampling', 'pre_production', 'production'];

    for (const phase of orderedPhases) {
        const milestones = phaseGroups.get(phase) || [];
        const phaseTotal = milestones.reduce((sum, m) => sum + m.points, 0);
        let phaseEarned = 0;
        const milestonesStatus = [];

        for (const milestone of milestones) {
            const completed = milestone.detect(project);

            if (completed) {
                phaseEarned += milestone.points;
                totalEarned += milestone.points;
                completedMilestones.push(milestone.key);
            } else {
                // First incomplete milestone is current
                if (!currentMilestone) {
                    currentMilestone = milestone.key;
                } else if (!nextMilestone && milestone.key !== currentMilestone) {
                    nextMilestone = milestone.key;
                }
            }

            milestonesStatus.push({
                key: milestone.key,
                label: milestone.label,
                completed,
                waiting: !completed && milestone.waitingLabel !== undefined,
                waitingLabel: milestone.waitingLabel
            });
        }

        phaseProgress.push({
            phase,
            earned: phaseEarned,
            total: phaseTotal,
            milestones: milestonesStatus
        });
    }

    // Determine current phase
    let currentPhase: ProjectPhase = 'planning';
    for (const pp of phaseProgress) {
        if (pp.earned < pp.total) {
            currentPhase = pp.phase;
            break;
        }
        if (pp.earned === pp.total && pp.phase === 'production') {
            currentPhase = 'completed';
        }
    }

    // Detect blockers
    if (!project.specs_confirmed_at && project.rfqs?.some(r => r.sentAt)) {
        blockers.push('Specs not confirmed - suppliers may quote inaccurately');
    }
    if (project.samples?.some(s => s.status === 'revision_requested')) {
        blockers.push('Sample revision requested - waiting for new sample');
    }

    return {
        percentage: totalEarned,
        currentPhase,
        completedMilestones,
        currentMilestone,
        nextMilestone,
        blockers,
        phaseProgress
    };
}
