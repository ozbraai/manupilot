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

        // 2. Fetch all projects
        const supabaseAdmin = getAdminClient();
        const { data: projects, error: projectsError } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        // 3. Fetch all RFQ submissions to count them
        const { data: rfqs, error: rfqsError } = await supabaseAdmin
            .from('rfq_submissions')
            .select('project_id, status');

        if (rfqsError) throw rfqsError;

        // 4. Fetch all users to map owners
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) throw usersError;

        // 5. Combine data
        const enrichedProjects = projects.map(project => {
            const owner = users.find(u => u.id === project.user_id);
            const projectRfqs = rfqs.filter(r => r.project_id === project.id);
            const rfqCount = projectRfqs.length;

            // Infer status
            let status = 'Not Started';
            if (rfqCount > 0) {
                status = 'In Progress'; // Assuming if RFQ sent, it's in progress
                if (projectRfqs.some(r => r.status === 'completed')) {
                    status = 'Completed';
                }
            }

            return {
                id: project.id,
                title: project.title,
                description: project.description,
                created_at: project.created_at,
                image_url: project.image_url,
                owner: {
                    email: owner?.email || 'Unknown',
                    id: project.user_id || ''
                },
                rfq_count: rfqCount,
                status: status,
                progress: 'N/A' // Client-side only
            };
        });

        return NextResponse.json({ projects: enrichedProjects });

    } catch (error: any) {
        console.error('Admin projects API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
        }

        const supabaseAdmin = getAdminClient();
        const { error } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Admin projects delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
