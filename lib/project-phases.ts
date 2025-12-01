import { ProjectPhase } from '@/types/project';

export const PROJECT_PHASES: { id: ProjectPhase; label: string; step: number }[] = [
    { id: 'planning', label: 'Planning', step: 1 },
    { id: 'supplier_sourcing', label: 'Sourcing', step: 2 },
    { id: 'sampling', label: 'Sampling', step: 3 },
    { id: 'pre_production', label: 'Pre-Production', step: 4 },
    { id: 'production', label: 'Production', step: 5 },
    { id: 'completed', label: 'Completed', step: 6 },
];

export function getPhaseDetails(phase: ProjectPhase) {
    return PROJECT_PHASES.find(p => p.id === phase) || PROJECT_PHASES[0];
}

export function inferProjectPhase(project: any, playbook: any): ProjectPhase {
    // 1. Check explicit phase if available (future proofing)
    if (project?.current_phase) return project.current_phase as ProjectPhase;

    // 2. Infer from RFQ status
    const rfqStatus = project?.rfq_status; // Assuming we might pass this in project object or fetch it

    // If we have a submitted RFQ but no samples yet
    if (rfqStatus === 'submitted' || rfqStatus === 'in_review') {
        return 'supplier_sourcing';
    }

    // 3. Infer from Roadmap Progress (rough heuristic)
    // We'll need to calculate this in the component usually, but if passed:
    const progress = project?.progress || 0;

    if (progress === 0) return 'planning';
    if (progress < 20) return 'supplier_sourcing';
    if (progress < 40) return 'supplier_sourcing';
    if (progress < 60) return 'sampling';
    if (progress < 80) return 'pre_production';
    if (progress < 95) return 'production';
    if (progress >= 95) return 'completed';

    // Default fallback
    return 'planning';
}

export function getNextPhase(current: ProjectPhase): ProjectPhase | null {
    const idx = PROJECT_PHASES.findIndex(p => p.id === current);
    if (idx === -1 || idx === PROJECT_PHASES.length - 1) return null;
    return PROJECT_PHASES[idx + 1].id;
}
