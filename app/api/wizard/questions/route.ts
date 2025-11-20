// app/api/wizard/questions/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea: string = body?.idea || '';
    const productName: string = (body?.productName || '').trim();
    const category: string = body?.category || 'general';
    const coreProduct: string = body?.coreProduct || productName || idea;
    const components = body?.components || {};
    const selectedSubProducts: { id: string; label: string }[] =
      body?.selectedSubProducts || [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY in /api/wizard/questions');
      return NextResponse.json(
        {
          questions: [],
        },
        { status: 200 }
      );
    }

    const subProductsText = selectedSubProducts
      .map((sp) => `- ${sp.id}: ${sp.label}`)
      .join('\n');

    const componentsText = Object.entries(components)
      .map(([key, list]) => `  ${key}: ${(list as string[]).join(', ')}`)
      .join('\n');

    const prompt = `
You are ManuBot, an expert manufacturing product developer.

You will write a small set of **tailored questions** that help the user specify their product for manufacturing.

Context:
- Idea: "${idea}"
- Product name: "${productName}"
- Core product: "${coreProduct}"
- Category: "${category}"
- Selected sub-products:
${subProductsText || '(none)'}
- Components:
${componentsText || '(none)'}

TASK:
Create 4–6 questions that collect high-value manufacturing information.
Each question MUST be returned as an object with:

{
  "key": "string_snake_case",
  "label": "short label e.g. 'Core – Description'",
  "title": "full question title",
  "helper": "longer explanation that guides the user what to write",
  "placeholder": "concrete example(s) tailored to this product"
}

Rules:
- The VERY FIRST question should focus on a detailed description of the CORE product.
  - Helper should say: "Describe your product in as much detail as possible: size, materials, key features, use cases, important details."
  - Placeholder should show a realistic, detailed example for this category (e.g. BBQ, camping chair, knife, etc.).
- For MATERIALS, give category-specific examples.
  - For BBQs: stainless steel 304, powder-coated steel, cast iron, etc. Never suggest plastic for high-heat parts.
  - For camping chairs: aluminium tubing, steel, 600D Oxford fabric, etc.
  - For knives: 1095, AUS-10, VG-10, G10, micarta, hardwood handles, etc.
- For sub-products (like covers, bags, packaging), ask separate questions that mention them explicitly in label and helper.
- Questions should be written in a friendly but professional tone.
- Avoid generic placeholders. THEY MUST look like a real example for this product category.

Return ONLY JSON:

{
  "questions": [ { ... }, { ... } ]
}
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You output only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1100,
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      console.error('Wizard questions AI error:', raw);
      return NextResponse.json(
        { questions: [] },
        { status: 200 }
      );
    }

    let payload: any = null;
    try {
      const parsed = JSON.parse(raw);
      const content = parsed.choices?.[0]?.message?.content || '{}';
      payload = JSON.parse(content);
    } catch (e) {
      console.error('Wizard questions parse error:', e, raw);
      return NextResponse.json(
        { questions: [] },
        { status: 200 }
      );
    }

    if (!Array.isArray(payload.questions)) {
      payload.questions = [];
    }

    return NextResponse.json({ questions: payload.questions });
  } catch (e: any) {
    console.error('wizard/questions route error:', e);
    return NextResponse.json(
      { questions: [] },
      { status: 200 }
    );
  }
}