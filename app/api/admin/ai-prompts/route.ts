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
        const category = searchParams.get('category');

        const supabaseAdmin = getAdminClient();
        let query = supabaseAdmin
            .from('ai_prompts')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        const { data: prompts, error } = await query;
        if (error) throw error;

        return NextResponse.json({ prompts });

    } catch (error: any) {
        console.error('Admin AI prompts API error:', error);
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
        const { id, action, ...promptData } = body;

        const supabaseAdmin = getAdminClient();

        // Handle freeze/unfreeze action
        if (action === 'freeze' || action === 'unfreeze') {
            const { data, error } = await supabaseAdmin
                .from('ai_prompts')
                .update({ is_frozen: action === 'freeze' })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ prompt: data });
        }

        // Handle update
        if (id) {
            // Check if frozen
            const { data: existing } = await supabaseAdmin
                .from('ai_prompts')
                .select('is_frozen')
                .eq('id', id)
                .single();

            if (existing?.is_frozen) {
                return NextResponse.json({ error: 'Cannot edit frozen prompt' }, { status: 403 });
            }

            const { data, error } = await supabaseAdmin
                .from('ai_prompts')
                .update({
                    ...promptData,
                    last_edited_by: user.id
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ prompt: data });
        } else {
            // Create new
            const { data, error } = await supabaseAdmin
                .from('ai_prompts')
                .insert({
                    ...promptData,
                    last_edited_by: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ prompt: data });
        }

    } catch (error: any) {
        console.error('Admin AI prompts save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
