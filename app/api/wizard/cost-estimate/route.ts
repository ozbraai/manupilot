import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea: string = body?.idea || '';
    const productName: string = (body?.productName || '').trim();
    const category: string = body?.category || 'general';
    const coreProduct: string = body?.coreProduct || productName || idea;
    const sourcingMode: string = body?.sourcingMode || 'auto';

    const prompt = `
You are ManuBot, an expert sourcing and costing assistant.

Estimate reasonable ranges for COST and MOQ for the following product.

Idea: "${idea}"
Core product: "${coreProduct}"
Category: "${category}"
Sourcing Mode: "${sourcingMode}"

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 600,
    });

    const content = completion.choices[0].message.content || '{}';
    let payload: any = {};

    try {
      payload = JSON.parse(content);
    } catch (e) {
      console.error('cost-estimate parse error:', e);
    }

    return NextResponse.json({
      unitCostRange: payload.unitCostRange || '',
      moqRange: payload.moqRange || '',
      retailRange: payload.retailRange || '',
      packagingCostRange: payload.packagingCostRange || '',
      notes: payload.notes || '',
    });

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