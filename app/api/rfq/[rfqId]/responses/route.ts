import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ rfqId: string }> }
) {
    const { rfqId } = await params;
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
                        // Ignored
                    }
                },
            },
        }
    );

    try {
        const { data: responses, error } = await supabase
            .from('rfq_responses')
            .select(`
        *,
        manufacturer:partners(id, name, logo_url)
      `)
            .eq('rfq_id', rfqId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ responses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ rfqId: string }> }
) {
    const { rfqId } = await params;
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
                        // Ignored
                    }
                },
            },
        }
    );

    try {
        const body = await request.json();
        const { manufacturerId, pricingData, rawText } = body;

        const { data: user } = await supabase.auth.getUser();

        // Insert initial response
        const { data, error } = await supabase
            .from('rfq_responses')
            .insert({
                rfq_id: rfqId,
                manufacturer_id: manufacturerId,
                pricing_data: pricingData || { raw_text: rawText },
                submitted_by_user_id: user.user?.id,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ response: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
