import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      idea,
      productName,
      category,
      coreProduct,
      sourcingMode,
      components,
      selectedSubProducts,
      constraints
    } = body;

    console.log('Generating questions for:', { productName, category, sourcingMode });

    // 1. Define Prompts based on Mode
    let systemPrompt = '';

    if (sourcingMode === 'white-label') {
      systemPrompt = `
You are ManuBot, an AI manufacturing and sourcing assistant helping a customer who wants to create a WHITE LABEL product. They are basing this on an existing factory product or reference.

Using the following information:
- Idea: ${idea}
- Product name: ${productName}
- Category: ${category}
- Core product: ${coreProduct}
- Sub-products: ${JSON.stringify(selectedSubProducts)}
- Components and supplier types: ${JSON.stringify(components)}
- Business constraints: ${JSON.stringify(constraints)}

Generate 5–7 questions that clarify:
1) What should stay the same as the reference product.
2) What they want to change (colors, small features, materials, packaging, branding).
3) How premium they want the quality compared to typical white-label versions.
4) Packaging and branding expectations.
5) Compliance and labeling expectations for the target markets.

For each question, return a JSON object:
{
  "key": "string_snake_case",
  "label": "short label",
  "title": "full question",
  "helper": "1–3 sentence explanation of why this matters in a WHITE LABEL context",
  "placeholder": "realistic example answer tailored for this product category"
}

Tailor helper and placeholder to the product CATEGORY. Use specific examples for BBQ, knives, camping gear, electronics, etc. Avoid generic text.
`;
    } else {
      // Default to Custom / OEM logic
      systemPrompt = `
You are ManuBot, an AI manufacturing and design assistant helping a customer build a CUSTOM product (OEM).

Using:
- Idea: ${idea}
- Product name: ${productName}
- Category: ${category}
- Core product: ${coreProduct}
- Sub-products: ${JSON.stringify(selectedSubProducts)}
- Components & supplier types: ${JSON.stringify(components)}
- Business constraints: ${JSON.stringify(constraints)}

Generate 6–10 deep questions that clarify:
1) Functional requirements & performance targets (load rating, IP rating, temp range, battery life, etc.).
2) Materials & durability (steel grade, fabric denier, handle materials, coatings, etc.).
3) User experience & quality tier (premium vs mid vs budget).
4) Usage environment (outdoor/indoor, food-contact, children, industrial).
5) Regulatory & safety expectations (standards that may apply).
6) Branding & packaging expectations.

For each question, return a JSON object:
{
  "key": "string_snake_case",
  "label": "short label",
  "title": "full question",
  "helper": "2–4 sentences explaining what a good answer should contain for this type of product",
  "placeholder": "specific example answer tailored to this product category"
}

Questions must sound like a senior product manager plus a manufacturing engineer wrote them. Use the CATEGORY to tailor helper & placeholder examples (BBQ vs knife vs camping chair vs electronics, etc.). Avoid generic 'tell us about materials' phrasing.
`;
    }

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful manufacturing assistant. Output valid JSON with a "questions" array.' },
        { role: 'user', content: systemPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Ensure we return { questions: [] } structure
    const questions = parsed.questions || parsed.items || [];

    return NextResponse.json({ questions });

  } catch (e: any) {
    console.error('Questions API Error:', e);
    // Return empty array instead of crashing
    return NextResponse.json({ questions: [] });
  }
}