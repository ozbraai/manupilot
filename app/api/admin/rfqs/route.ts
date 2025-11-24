import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to get admin client
function getAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

export async function GET(request: Request) {
    try {
        // 1. Verify requester is admin
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch all RFQs
        const supabaseAdmin = getAdminClient();
        const { data: rfqs, error: rfqsError } = await supabaseAdmin
            .from('rfq_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (rfqsError) throw rfqsError;

        // 3. Fetch all Projects (to get titles)
        const { data: projects, error: projectsError } = await supabaseAdmin
            .from('projects')
            .select('id, title');

        if (projectsError) throw projectsError;

        // 4. Fetch all Users (to get emails)
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) throw usersError;

        // 5. Combine data
        const enrichedRfqs = rfqs.map(rfq => {
            const project = projects.find(p => p.id === rfq.project_id);
            const owner = users.find(u => u.id === rfq.user_id);

            // Extract matches count from rfq_data
            const matches = rfq.rfq_data?.matched_partner_ids?.length || 0;

            return {
                id: rfq.id,
                created_at: rfq.created_at,
                status: rfq.status,
                project: {
                    id: rfq.project_id,
                    title: project?.title || 'Unknown Project'
                },
                owner: {
                    id: rfq.user_id || '',
                    email: owner?.email || 'Unknown'
                },
                matches_count: matches,
                rfq_data: rfq.rfq_data
            };
        });

        return NextResponse.json({ rfqs: enrichedRfqs });

    } catch (error: any) {
        console.error('Admin RFQs API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // 1. Verify requester is admin
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseAdmin = getAdminClient();
        const { data, error } = await supabaseAdmin
            .from('rfq_submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ rfq: data });

    } catch (error: any) {
        console.error('Admin RFQs update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
