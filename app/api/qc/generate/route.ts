import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabaseClient';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { projectId, sampleId, playbook } = await request.json();

        if (!projectId || !sampleId || !playbook) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Construct Prompt
        const prompt = `
      You are a Quality Control Expert for manufacturing.
      Generate a checklist of 6-10 critical quality control (QC) checks for the following product.
      
      Product: ${playbook.productName}
      Category: ${playbook.category}
      Core Description: ${playbook.coreProduct}
      Materials: ${playbook.free?.materials?.join(', ') || 'Standard'}
      Target Market: ${playbook.constraints?.markets || 'Global'}

      The checks should be specific, actionable, and cover:
      1. Visual/Cosmetic (defects, finish)
      2. Functional (does it work?)
      3. Structural/Durability (strength, assembly)
      4. Safety/Compliance (if applicable)

      Return a JSON object with a single key "items" containing an array of strings.
      Example: { "items": ["Check for sharp edges", "Verify logo alignment"] }
    `;

        // 2. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful manufacturing assistant. Output valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No content from AI');

        console.log('AI QC Response:', content); // Debug log

        let checklistItems: string[] = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                checklistItems = parsed;
            } else if (parsed.items && Array.isArray(parsed.items)) {
                checklistItems = parsed.items;
            } else if (parsed.checklist && Array.isArray(parsed.checklist)) {
                checklistItems = parsed.checklist;
            } else if (parsed.checks && Array.isArray(parsed.checks)) {
                checklistItems = parsed.checks;
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error('Failed to parse AI response');
        }

        if (checklistItems.length === 0) {
            throw new Error('Invalid AI response format: No items found');
        }

        // 3. Insert into DB
        const inserts = checklistItems.map(criteria => ({
            sample_id: sampleId,
            criteria: criteria,
            result: 'not_checked'
        }));

        const { data, error } = await supabase
            .from('sample_qc')
            .insert(inserts)
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, items: data });

    } catch (error: any) {
        console.error('Error generating QC:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate QC' }, { status: 500 });
    }
}
