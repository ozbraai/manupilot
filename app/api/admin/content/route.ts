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
        const type = searchParams.get('type');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        const supabaseAdmin = getAdminClient();
        let query = supabaseAdmin
            .from('content')
            .select('*')
            .order('created_at', { ascending: false });

        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        if (!includeDeleted) {
            query = query.eq('is_deleted', false);
        }

        const { data: content, error } = await query;
        if (error) throw error;

        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Admin content API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { id, ...contentData } = body;

        const supabaseAdmin = getAdminClient();

        if (id) {
            // Update existing content
            const { data, error } = await supabaseAdmin
                .from('content')
                .update(contentData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ content: data });
        } else {
            // Create new content
            const { data, error } = await supabaseAdmin
                .from('content')
                .insert({
                    ...contentData,
                    author_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ content: data });
        }

    } catch (error: any) {
        console.error('Admin content save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing content ID' }, { status: 400 });
        }

        const supabaseAdmin = getAdminClient();
        // Soft delete
        const { error } = await supabaseAdmin
            .from('content')
            .update({ is_deleted: true })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Admin content delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
