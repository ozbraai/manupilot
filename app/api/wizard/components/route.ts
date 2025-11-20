// app/api/wizard/components/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { idea, productName } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json(
        { coreProduct: productName || 'Core product', suggestedComponents: [] },
        { status: 200 }
      );
    }

    const prompt = `
You are ManuBot, an assistant helping to break a product idea into components.

Given this idea:

"${idea}"

Short product name: "${productName || ''}"

1. Identify the CORE product (the main functional item).
2. Suggest 2–4 additional components or extras that a founder might reasonably want help with, such as:
   - Carry bag / case
   - Retail packaging
   - Instructions / booklet
   - Accessories
   - Mounting hardware
3. Mark exactly ONE component as required = true (the core product).
4. All others are required = false.

Output JSON in this format, and nothing else:

{
  "coreProduct": "string",
  "suggestedComponents": [
    { "id": "core", "label": "string", "required": true },
    { "id": "bag", "label": "string", "required": false },
    { "id": "packaging", "label": "string", "required": false }
  ]
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
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      console.error('components route AI error:', raw);
      return NextResponse.json(
        { coreProduct: productName || 'Core product', suggestedComponents: [] },
        { status: 200 }
      );
    }

    let payload: any = null;
    try {
      const parsed = JSON.parse(raw);
      const content = parsed.choices?.[0]?.message?.content || '{}';
      payload = JSON.parse(content);
    } catch (e) {
      console.error('components route parse error:', e, raw);
      return NextResponse.json(
        {
          coreProduct: productName || 'Core product',
          suggestedComponents: [
            {
              id: 'core',
              label: productName || 'Core product',
              required: true,
            },
          ],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error('components route error:', e);
    return NextResponse.json(
      {
        coreProduct: productName || 'Core product',
        suggestedComponents: [
          { id: 'core', label: productName || 'Core product', required: true },
        ],
      },
      { status: 200 }
    );
  }
}