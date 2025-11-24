import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET - Get all quotes for an RFQ
export async function GET(request: NextRequest) {
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
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
        return NextResponse.json({ error: 'RFQ ID required' }, { status: 400 });
    }

    // Fetch quotes with partner info
    const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
      *,
      partner:partners(id, name, region, rating, image_url)
    `)
        .eq('rfq_id', rfqId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quotes });
}

// POST - Submit or update a quote
export async function POST(request: NextRequest) {
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
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
        rfqId,
        partnerId,
        unitPrice,
        currency = 'USD',
        leadTimeDays,
        moq,
        paymentTerms,
        shippingTerms,
        productionCapacity,
        notes,
        validityDays = 30
    } = body;

    // Validation
    if (!rfqId || !partnerId || !unitPrice || !leadTimeDays || !moq) {
        return NextResponse.json({
            error: 'Required fields: rfqId, partnerId, unitPrice, leadTimeDays, moq'
        }, { status: 400 });
    }

    // Calculate total price (can be refined based on quantity from RFQ)
    const totalPrice = unitPrice * moq;

    // Upsert quote
    const { data: quote, error } = await supabase
        .from('quotes')
        .upsert({
            rfq_id: rfqId,
            partner_id: partnerId,
            submitted_by_user_id: user.id,
            unit_price: unitPrice,
            currency,
            total_price: totalPrice,
            lead_time_days: leadTimeDays,
            production_capacity: productionCapacity,
            moq,
            payment_terms: paymentTerms,
            shipping_terms: shippingTerms,
            notes,
            validity_days: validityDays,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'rfq_id,partner_id'
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting quote:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quote });
}
