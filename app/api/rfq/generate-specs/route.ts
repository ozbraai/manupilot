import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        // 1. Authenticate
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productTitle, category, description } = await request.json();

        if (!productTitle) {
            return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
        }

        // 2. Generate Specs with OpenAI
        const prompt = `
        You are an expert manufacturing engineer. 
        Identify the 5-7 most critical manufacturing attributes (Technical Specifications) for a "${productTitle}" (${category || 'General Product'}).
        
        Context: ${description || 'No additional context provided.'}

        For each attribute, provide:
        1. Feature/Component Name
        2. Specification / Target Value (be specific, e.g., "304 Stainless Steel" not just "Metal")
        3. Tolerance / Standard (e.g., "±0.05mm" or "ISO 9001" or "AQL 2.5")
        4. Criticality (High/Medium/Low)

        Return ONLY a JSON array of objects with keys: "feature", "spec", "tolerance", "criticality".
        Do not include markdown formatting.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a manufacturing specification generator. Output JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3, // Low temperature for consistent, factual output
        });

        const content = completion.choices[0].message.content;
        let specs = [];
        try {
            // Handle potential markdown code blocks
            const cleanContent = content?.replace(/```json/g, '').replace(/```/g, '').trim() || '[]';
            specs = JSON.parse(cleanContent);
        } catch (e) {
            console.error('Failed to parse OpenAI response:', content);
            return NextResponse.json({ error: 'Failed to generate valid specs' }, { status: 500 });
        }

        return NextResponse.json({ specs });

    } catch (error: any) {
        console.error('Error generating specs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
