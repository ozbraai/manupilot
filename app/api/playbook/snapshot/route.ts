// app/api/playbook/snapshot/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { PlaybookSnapshot } from '@/types/playbook';
import type { PlaybookV2WithOverrides } from '@/types/playbook';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { playbookData } = body as { playbookData: PlaybookV2WithOverrides };

        if (!playbookData) {
            return NextResponse.json(
                { error: 'Playbook data is required' },
                { status: 400 }
            );
        }

        // Create frozen snapshot from current playbook state
        const snapshot: PlaybookSnapshot = {
            // AI baseline - original estimates (never modified)
            ai_baseline: {
                unitEconomics: playbookData.free?.financials?.unitEconomics || {},
                startupCapital: playbookData.free?.financials?.startupCapital || {},
                manufacturingApproach: playbookData.free?.manufacturingApproach,
                pricing: playbookData.free?.pricing,
                timeline: playbookData.free?.timeline || [],
                nextSteps: playbookData.free?.nextSteps || [],
                hiddenCosts: playbookData.free?.financials?.hiddenCosts || [],
            },

            // Wizard input (original user idea)
            wizard_input: playbookData.wizardInput || {
                originalIdea: '',
                referenceLink: '',
                referenceImage: '',
                designStage: '',
            },

            // User overrides (financial modeling)
            user_overrides: playbookData.userOverrides || {},

            // Final edits to content
            final_edits: {
                summary: playbookData.free?.summary,
                targetCustomer: playbookData.free?.targetCustomer,
                keyFeatures: playbookData.free?.keyFeatures || [],
                materials: playbookData.free?.materials || [],
            },

            // Feasibility snapshot - check multiple possible locations
            feasibility: playbookData.feasibilitySnapshot || (playbookData.free as any)?.feasibility || null,

            // Commercials (Legacy/V2 support)
            costEstimate: playbookData.costEstimate,
            constraints: playbookData.constraints,

            // Metadata
            snapshot_date: new Date().toISOString(),
            product_name: playbookData.productName || 'Untitled Product',
            category: playbookData.category || 'Other',
            sourcing_mode: playbookData.mode || 'white-label',
            uniqueness_factor: (playbookData as any).uniquenessFactor,
            differentiation_text: (playbookData as any).differentiationText || '',
        };

        return NextResponse.json({ snapshot }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating playbook snapshot:', error);
        return NextResponse.json(
            { error: 'Failed to create snapshot', details: error.message },
            { status: 500 }
        );
    }
}
