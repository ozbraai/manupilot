import { Project } from '@/types/project';

export const SPEC_FIELDS = [
    { key: 'materials', label: 'Materials', required: true, weight: 20 },
    { key: 'features', label: 'Key Features', required: true, weight: 15 },
    { key: 'dimensions', label: 'Dimensions', required: true, weight: 20 },
    { key: 'weightCapacity', label: 'Weight Capacity', required: true, weight: 15 },
    { key: 'colors', label: 'Color Options', required: false, weight: 10 },
    { key: 'packaging', label: 'Packaging', required: false, weight: 10 },
    { key: 'targetMarkets', label: 'Target Markets', required: false, weight: 10 }
];

export interface SpecCompleteness {
    percentage: number;
    missing: {
        field: string;
        label: string;
        required: boolean;
    }[];
}

export function calculateSpecCompleteness(project: Project): SpecCompleteness {
    let earned = 0;
    const missing: SpecCompleteness['missing'] = [];

    const specs = project.specs || {};

    for (const field of SPEC_FIELDS) {
        let hasValue = false;
        const value = specs[field.key as keyof typeof specs];

        if (Array.isArray(value)) {
            hasValue = value.length > 0;
        } else if (typeof value === 'string') {
            hasValue = value.trim().length > 0;
        }

        if (hasValue) {
            earned += field.weight;
        } else {
            missing.push({
                field: field.key,
                label: field.label,
                required: field.required
            });
        }
    }

    return { percentage: Math.min(earned, 100), missing };
}
