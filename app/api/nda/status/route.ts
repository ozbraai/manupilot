import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CURRENT_NDA_VERSION } from '@/lib/nda';

export async function GET(request: Request) {
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

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: acceptance } = await supabase
        .from('nda_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .eq('nda_version', CURRENT_NDA_VERSION)
        .single();

    if (acceptance) {
        return NextResponse.json({
            hasSigned: true,
            ndaVersion: CURRENT_NDA_VERSION,
            acceptedAt: acceptance.accepted_at,
        });
    }

    return NextResponse.json({
        hasSigned: false,
        ndaVersion: CURRENT_NDA_VERSION,
    });
}

export async function DELETE(request: Request) {
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

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS policies that might prevent deletion
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        }
    );

    const { error, count } = await supabaseAdmin
        .from('nda_acceptances')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .eq('nda_version', CURRENT_NDA_VERSION);

    console.log(`[NDA Reset] User ${user.id} attempting delete. Version: ${CURRENT_NDA_VERSION}. Error: ${error?.message}. Count: ${count}`);

    if (error) {
        console.error('Error deleting NDA acceptance:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/account/settings');
    return NextResponse.json({ success: true, count });
}
