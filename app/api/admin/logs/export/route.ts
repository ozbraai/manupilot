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

        const supabaseAdmin = getAdminClient();

        // Build query (same filters as main endpoint, but no pagination)
        let query = supabaseAdmin
            .from('logs')
            .select('*')
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

        const { data: logs, error } = await query;
        if (error) throw error;

        // Fetch user and project data separately for CSV
        const userIds = logs?.filter(l => l.user_id).map(l => l.user_id) || [];
        const projectIds = logs?.filter(l => l.project_id).map(l => l.project_id) || [];

        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const { data: projects } = await supabaseAdmin
            .from('projects')
            .select('id, name')
            .in('id', projectIds);

        const userMap = new Map(users?.users?.map(u => [u.id, u.email]) || []);
        const projectMap = new Map(projects?.map(p => [p.id, p.name]) || []);

        // Generate CSV
        const headers = ['Timestamp', 'Type', 'Severity', 'User', 'Project', 'Error Type', 'Message', 'Metadata'];
        const rows = logs?.map(log => [
            new Date(log.created_at).toISOString(),
            log.log_type,
            log.severity,
            (log.user_id && userMap.get(log.user_id)) || 'N/A',
            (log.project_id && projectMap.get(log.project_id)) || 'N/A',
            log.error_type || 'N/A',
            log.message.replace(/"/g, '""'), // Escape quotes
            JSON.stringify(log.metadata || {}).replace(/"/g, '""')
        ]) || [];

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `logs_${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error('Admin logs export error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
