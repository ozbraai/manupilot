import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Admin client for user management
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
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch all users
        const supabaseAdmin = getAdminClient();
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) throw usersError;

        // 3. Fetch project counts for all users (group by user_id)
        // Note: We can't easily join auth.users with public.projects in one query via JS client
        // So we'll fetch all projects (lightweight) or use a rpc if performance becomes an issue.
        // For now, fetching all projects with just user_id is okay for < 1000 users.

        const { data: projects, error: projectsError } = await supabaseAdmin
            .from('projects')
            .select('user_id');

        if (projectsError) {
            console.error('Error fetching projects:', projectsError);
            // Continue without project counts
        }

        const projectCounts: Record<string, number> = {};
        projects?.forEach((p: any) => {
            projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
        });

        // 4. Transform data
        const enrichedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.user_metadata?.fullName || 'N/A',
            role: u.app_metadata?.role || 'user',
            verified: u.email_confirmed_at ? true : false,
            createdAt: u.created_at,
            lastSignIn: u.last_sign_in_at,
            projectsCount: projectCounts[u.id] || 0,
            banned: (u as any).banned_until ? true : false
        }));

        return NextResponse.json({ users: enrichedUsers });

    } catch (error: any) {
        console.error('Admin users API error:', error);
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
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, action, value } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (action === 'updateRole') {
            const supabaseAdmin = getAdminClient();
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { app_metadata: { role: value } }
            );
            if (error) throw error;
        } else if (action === 'toggleBan') {
            const banDuration = value ? '876600h' : '0s'; // 100 years or 0
            const supabaseAdmin = getAdminClient();
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { ban_duration: banDuration }
            );
            if (error) throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Admin users action error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
