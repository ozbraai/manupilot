// app/api/wizard/components/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea: string = body?.idea || '';
    const rawProductName: string = (body?.productName || '').trim();

    // Safe base name we can use anywhere
    const baseName = rawProductName || 'Core product';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      // Return safe defaults that match your Frontend's "ComponentsInfo" type
      return NextResponse.json(
        {
          coreProduct: baseName,
          category: "General",
          subProducts: [],
          components: {},
          supplierTypes: [],
          whiteLabelSuitability: { score: 0.5, reason: "API Key missing" }
        },
        { status: 200 }
      );
    }

    // The Prompt: Strictly aligned with your Frontend's ComponentsInfo type
    const prompt = `
    You are an expert manufacturing engineer. Analyze this product idea:
    
    Product Name: "${rawProductName}"
    Description: "${idea}"

    Output a JSON object with the following manufacturing details:
    
    1. "coreProduct": The concise name of the main item.
    2. "category": A standard industrial category (e.g., "Consumer Electronics", "Soft Goods", "Injection Molded Plastics").
    3. "subProducts": An array of potential variants or add-ons (e.g., "Carry Case", "Pro Version"). Each object: { "id": "string", "label": "string", "description": "string" }.
    4. "components": A categorization of parts. Object where Key = Section (e.g., "Enclosure", "Electronics", "Packaging") and Value = Array of part names.
    5. "supplierTypes": Array of factory types needed (e.g., "PCBA House", "Cut & Sew", "Metal Stamping").
    6. "whiteLabelSuitability": Object with:
       - "score": number (0.0 to 1.0) representing how easy it is to find this off-the-shelf (Alibaba/ODM).
       - "reason": Short explanation.
    
    Strictly output valid JSON only.
    `;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and capable enough for structured JSON
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a manufacturing engineer. Output only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) throw new Error('OpenAI API error');

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error('No content from AI');

    const payload = JSON.parse(content);

    // Return the rich payload your frontend expects
    // We add fallbacks (||) to ensure the app never crashes if AI misses a field
    return NextResponse.json({
      coreProduct: payload.coreProduct || baseName,
      category: payload.category || 'General',
      subProducts: Array.isArray(payload.subProducts) ? payload.subProducts : [],
      components: payload.components || {},
      supplierTypes: Array.isArray(payload.supplierTypes) ? payload.supplierTypes : [],
      whiteLabelSuitability: payload.whiteLabelSuitability || { score: 0, reason: "N/A" }
    });

  } catch (e: any) {
    console.error('Components API Error:', e);
    // Fallback error response
    return NextResponse.json(
      { error: 'Failed to analyze components' },
      { status: 500 }
    );
  }
}