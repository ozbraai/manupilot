import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeQuote } from '@/lib/ai/quote-analyzer';

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
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    );

    try {
        const body = await request.json();
        const { responseId, rawText, targetPrice, targetMoq } = body;

        if (!responseId || !rawText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Run AI Analysis
        const analysis = await analyzeQuote(rawText, { targetPrice, targetMoq });

        // Update the response with analysis results
        const { data, error } = await supabase
            .from('rfq_responses')
            .update({
                extracted_metrics: analysis.metrics,
                ai_analysis: {
                    score: analysis.score,
                    flags: analysis.flags,
                    summary: analysis.summary,
                },
            })
            .eq('id', responseId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, analysis, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
