// app/api/wizard/cost-estimate/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea: string = body?.idea || '';
    const productName: string = (body?.productName || '').trim();
    const category: string = body?.category || 'general';
    const coreProduct: string = body?.coreProduct || productName || idea;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY in /api/wizard/cost-estimate');
      return NextResponse.json(
        {
          unitCostRange: '',
          moqRange: '',
          retailRange: '',
          packagingCostRange: '',
          notes: '',
        },
        { status: 200 }
      );
    }

    const prompt = `
You are ManuBot, an expert sourcing and costing assistant.

Estimate reasonable ranges for COST and MOQ for the following product.

Idea:
"${idea}"

Core product:
"${coreProduct}"

Category:
"${category}"

TASK:
Return approximate ranges (in USD) that a first-time buyer could expect when working with typical factories in Asia for this product category.

Fields:
- unitCostRange: e.g. "$10 – $18 per unit"
- moqRange: e.g. "300 – 800 units"
- retailRange: e.g. "$79 – $129"
- packagingCostRange: e.g. "$0.80 – $1.50 per unit"
- notes: a short paragraph explaining the assumptions, and warning that these are ballpark figures.

Rules:
- Be conservative but realistic.
- For heavy metal products like BBQs, costs and MOQs will be higher.
- For textiles/bags, costs are lower but MOQs can still be 300–1000+.
- For electronics, expect tooling and certification overheads.
- DO NOT return commentary, only JSON.

Return JSON:

{
  "unitCostRange": "string",
  "moqRange": "string",
  "retailRange": "string",
  "packagingCostRange": "string",
  "notes": "string"
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
        max_tokens: 600,
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      console.error('Wizard cost-estimate AI error:', raw);
      return NextResponse.json(
        {
          unitCostRange: '',
          moqRange: '',
          retailRange: '',
          packagingCostRange: '',
          notes: '',
        },
        { status: 200 }
      );
    }

    let payload: any = null;
    try {
      const parsed = JSON.parse(raw);
      const content = parsed.choices?.[0]?.message?.content || '{}';
      payload = JSON.parse(content);
    } catch (e) {
      console.error('cost-estimate parse error:', e, raw);
      return NextResponse.json(
        {
          unitCostRange: '',
          moqRange: '',
          retailRange: '',
          packagingCostRange: '',
          notes: '',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error('wizard/cost-estimate route error:', e);
    return NextResponse.json(
      {
        unitCostRange: '',
        moqRange: '',
        retailRange: '',
        packagingCostRange: '',
        notes: '',
      },
      { status: 200 }
    );
  }
}