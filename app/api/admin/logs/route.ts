import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
        const logType = searchParams.get('log_type');
        const severity = searchParams.get('severity');
        const userId = searchParams.get('user_id');
        const projectId = searchParams.get('project_id');
        const supplierId = searchParams.get('supplier_id');
        const errorType = searchParams.get('error_type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabaseAdmin = getAdminClient();

        // Build query
        let query = supabaseAdmin
            .from('logs')
            .select('*, user:auth.users!user_id(id, email), project:projects(id, name)', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filters
        if (logType && logType !== 'all') {
            query = query.eq('log_type', logType);
        }
        if (severity) {
            query = query.eq('severity', severity);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }
        if (projectId) {
            query = query.eq('project_id', projectId);
        }
        if (supplierId) {
            query = query.eq('supplier_id', supplierId);
        }
        if (errorType) {
            query = query.eq('error_type', errorType);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: logs, error, count } = await query;
        if (error) throw error;

        return NextResponse.json({ logs, count });

    } catch (error: any) {
        console.error('Admin logs API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
