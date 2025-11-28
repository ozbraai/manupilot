import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CURRENT_NDA_VERSION } from '@/lib/nda';

export async function POST(request: Request) {
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

    try {
        const body = await request.json();
        const { typedName } = body;

        const ipAddress = request.headers.get('x-forwarded-for') || null;
        const userAgent = request.headers.get('user-agent') || null;

        const { data, error } = await supabase
            .from('nda_acceptances')
            .insert({
                user_id: user.id,
                nda_version: CURRENT_NDA_VERSION,
                typed_name: typedName || null,
                ip_address: ipAddress,
                user_agent: userAgent,
            })
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation gracefully (idempotency)
            if (error.code === '23505') { // unique_violation
                const { data: existing } = await supabase
                    .from('nda_acceptances')
                    .select()
                    .eq('user_id', user.id)
                    .eq('nda_version', CURRENT_NDA_VERSION)
                    .single();
                return NextResponse.json({ success: true, record: existing });
            }
            throw error;
        }

        return NextResponse.json({ success: true, record: data });
    } catch (error: any) {
        console.error('NDA acceptance error:', error);
        return NextResponse.json({ error: 'Failed to record acceptance' }, { status: 500 });
    }
}
