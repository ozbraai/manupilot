import { loadProject } from '@/lib/project-loader';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ProjectShell from '@/components/project/ProjectShell';
import ReadinessCheck from '@/components/rfq/ReadinessCheck';
import CategoryTips from '@/components/rfq/CategoryTips';
import RFQBuilder from '@/components/rfq/RFQBuilder';
import MatchedSuppliers from '@/components/rfq/MatchedSuppliers';
import ResponseTracker from '@/components/rfq/ResponseTracker';
import QuoteComparison from '@/components/rfq/QuoteComparison';
import SupplierSelector from '@/components/rfq/SupplierSelector';
import RFQPreview from '@/components/rfq/RFQPreview';
import { Project } from '@/types/project';

export default async function ProjectSuppliersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await loadProject(id);
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Project not found</div>;
    }

    // Fetch RFQ Submissions
    const { data: rfqData } = await supabase
        .from('rfq_submissions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    let rfq = null;
    if (rfqData) {
        rfq = {
            ...rfqData.rfq_data,
            sentAt: rfqData.created_at,
            referenceNumber: `RFQ-${new Date(rfqData.created_at).getFullYear()}-${project.title?.substring(0, 3).toUpperCase() || 'PRJ'}`
        };
    }

    // Fetch Quotes (Mock for now if table doesn't exist, or try to fetch)
    // In a real scenario, we'd fetch from 'quotes' table
    // const { data: quotesData } = await supabase.from('quotes').select('*').eq('project_id', id);
    // const quotes = quotesData || [];
    const quotes: any[] = []; // Placeholder for now

    // Determine State
    const rfqSent = !!rfq;
    const hasQuotes = quotes.length > 0;

    return (
        <ProjectShell
            projectId={project.id}
            title={project.title}
            activeView="sourcing"
        >
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Suppliers & Quotes</h1>
                        <p className="text-slate-500">
                            {rfqSent
                                ? hasQuotes ? 'Compare quotes and select your partner.' : 'Tracking supplier responses.'
                                : 'Find partners, send RFQs, and compare quotes.'}
                        </p>
                    </div>
                </div>

                {!rfqSent ? (
                    // === STATE A: PREPARATION ===
                    <>
                        <ReadinessCheck project={project as unknown as Project} />
                        <CategoryTips category={project.category} />

                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">RFQ Builder</h2>
                            <RFQBuilder
                                projectId={project.id}
                                projectTitle={project.title}
                                sourcingMode="custom" // Default
                                bomCount={0}
                                targetPrice={project.targetUnitCost?.toString() || ''}
                                targetMoq={project.targetMOQ?.toString() || '500'}
                                playbook={project.playbook_snapshot}
                                onSuccess={async () => {
                                    'use server';
                                    // This needs to be a client action or handled by a client component wrapper
                                    // For now, RFQBuilder is likely a client component, so it handles the submission.
                                    // But refreshing the page to see the new state requires router.refresh() which is client side.
                                    // We might need to wrap the content in a client component if we want instant feedback without full reload.
                                    // However, for this refactor, we are just moving data fetching to server.
                                }}
                            />
                        </div>

                        <MatchedSuppliers project={project as unknown as Project} />
                    </>
                ) : !hasQuotes ? (
                    // === STATE B: WAITING FOR RESPONSES ===
                    <>
                        <ResponseTracker rfq={rfq} quotes={quotes} />
                        <RFQPreview rfq={rfq} projectTitle={project.title} />
                    </>
                ) : (
                    // === STATE C: QUOTES RECEIVED ===
                    <>
                        <ResponseTracker rfq={rfq} quotes={quotes} />
                        <QuoteComparison quotes={quotes} project={project as unknown as Project} />
                        <SupplierSelector quotes={quotes} onSelect={async (supplierId) => {
                            'use server';
                            // Same issue here, SupplierSelector needs to be client side or handle this via server action
                        }} />
                    </>
                )}

            </div>
        </ProjectShell>
    );
}
