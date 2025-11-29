import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { photoUrl, context, sampleId, photoId } = await request.json();

        if (!photoUrl || !sampleId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Supabase Server Client
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

        // Verify User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Construct Prompt
        const prompt = `
      You are a Manufacturing Quality Control Expert.
      Analyze this photo of a product sample.
      
      Context: ${context || 'General product inspection'}
      
      Please provide:
      1. A brief description of what you see.
      2. Any visible defects or quality issues (scratches, misalignment, color issues, etc.).
      3. A "Pass" or "Fail" recommendation based on visual inspection.
      
      Return a JSON object with keys: "description", "defects" (array of strings), "recommendation" (string), "confidence" (number 0-100).
    `;

        // 2. Call OpenAI Vision
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": photoUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No content from AI');

        const analysis = JSON.parse(content);

        // 3. Save Analysis to DB (optional, but good for caching)
        if (photoId) {
            await supabase
                .from('sample_photos')
                .update({ ai_analysis: analysis })
                .eq('id', photoId);
        }

        return NextResponse.json({ success: true, analysis });

    } catch (error: any) {
        console.error('Error analyzing sample:', error);
        return NextResponse.json({ error: error.message || 'Failed to analyze sample' }, { status: 500 });
    }
}
