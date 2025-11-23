import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
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

    const { projectId, rfqData } = await request.json();

    if (!projectId || !rfqData) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { data: user } = await supabase.auth.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 1. Find Matching Partners FIRST
        const { data: partners, error: partnersError } = await supabase
            .from('partners')
            .select('*')
            .eq('type', 'manufacturer');

        let matches: any[] = [];
        let matchedPartnerIds: string[] = [];

        if (!partnersError && partners) {
            // Simple matching logic
            const searchTerms = [
                ...(rfqData.process ? [rfqData.process] : []),
                ...(rfqData.materials ? [rfqData.materials] : []),
                ...rfqData.projectTitle.split(' ').filter((w: string) => w.length > 3)
            ].map(t => t.toLowerCase());

            matches = partners.filter(partner => {
                const capabilities = (partner.capabilities || []).map((c: string) => c.toLowerCase());
                const description = (partner.description || '').toLowerCase();

                return searchTerms.some(term =>
                    capabilities.some((cap: string) => cap.includes(term)) ||
                    description.includes(term)
                );
            });

            matchedPartnerIds = matches.map(p => p.id);
        }

        // 2. Insert RFQ Submission WITH matched partner IDs
        const { error: insertError } = await supabase.from('rfq_submissions').insert({
            project_id: projectId,
            user_id: user.user?.id,
            rfq_data: {
                ...rfqData,
                matched_partner_ids: matchedPartnerIds, // Save the IDs
            },
            status: 'submitted',
        });

        if (insertError) {
            console.error('Database error:', insertError);
            return new Response(JSON.stringify({ error: insertError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            message: 'RFQ submitted successfully',
            matches: matches
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Server error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
