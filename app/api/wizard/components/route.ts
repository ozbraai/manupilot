import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea: string = body?.idea || '';
    const rawProductName: string = (body?.productName || '').trim();
    const sourcingMode: string = body?.sourcingMode || 'auto';

    // Safe base name we can use anywhere
    const baseName = rawProductName || 'Core product';

    const prompt = `
You are an expert manufacturing engineer. Analyze this product idea:

Product Name: "${rawProductName}"
Description: "${idea}"
Sourcing Mode: "${sourcingMode}"

Output a JSON object with the following manufacturing details:

1. "coreProduct": The concise name of the main item.
2. "coreProductSummary": A 1-2 sentence summary describing what this product is and its primary function.
3. "category": A standard industrial category (e.g., "Consumer Electronics", "Soft Goods", "Injection Molded Plastics").
4. "keyCharacteristics": Array of 3-5 key characteristics or features (e.g., ["Portable", "Stainless steel construction", "Charcoal fueled"]).
5. "subProducts": An array of potential variants or add-ons (e.g., "Carry Case", "Pro Version"). 
   - Each object: { "id": "string", "label": "string", "role": "accessory" | "packaging" | "documentation", "description": "string" }.
   - IMPORTANT: Do NOT include generic packaging/instructions unless they are complex/custom.
6. "components": A categorization of parts. 
   - Key = "core" or the subProduct "id".
   - Value = Array of part names for that item.
7. "supplierTypes": Array of factory types needed (e.g., "PCBA House", "Cut & Sew", "Metal Stamping").
8. "whiteLabelSuitability": Object with:
   - "score": number (0.0 to 1.0) representing how easy it is to find this off-the-shelf.
   - "reason": Short explanation.
   - "typicalChanges": (optional) Array of common modifications for white-label products.
   - "examples": (optional) Array of example products that could be white-labeled.

Strictly output valid JSON only.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a manufacturing engineer. Output only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content || '{}';
    let payload: any = {};

    try {
      payload = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON from AI:', e);
    }

    return NextResponse.json({
      coreProduct: payload.coreProduct || baseName,
      coreProductSummary: payload.coreProductSummary || '',
      category: payload.category || 'General',
      keyCharacteristics: Array.isArray(payload.keyCharacteristics) ? payload.keyCharacteristics : [],
      subProducts: Array.isArray(payload.subProducts) ? payload.subProducts : [],
      components: payload.components || { core: [] },
      supplierTypes: Array.isArray(payload.supplierTypes) ? payload.supplierTypes : [],
      whiteLabelSuitability: payload.whiteLabelSuitability || { score: 0.5, reason: "N/A" }
    });

  } catch (e: any) {
    console.error('Components API Error:', e);
    return NextResponse.json(
      { error: 'Failed to analyze components' },
      { status: 500 }
    );
  }
}