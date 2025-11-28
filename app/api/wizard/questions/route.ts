// app/api/wizard/questions/route.ts

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
      selectedSubProducts
    } = body as {
      idea?: string;
      productName?: string;
      category?: string;
      coreProduct?: string;
      sourcingMode?: string;
      components?: any;
      selectedSubProducts?: any;
    };

    const systemPrompt = buildSystemPrompt({
      idea: idea ?? '',
      productName: productName ?? '',
      category: category ?? '',
      coreProduct: coreProduct ?? '',
      sourcingMode: sourcingMode ?? 'auto',
      components,
      selectedSubProducts
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are ManuBot, a senior manufacturing and NPI assistant. Always return VALID JSON with a "questions" array.'
        },
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: any;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Questions API – JSON parse error:', e, content);
      return NextResponse.json({ questions: [] });
    }

    // Ensure we return { questions: [] } structure
    const questions = parsed.questions || parsed.items || [];

    return NextResponse.json({ questions });
  } catch (e: any) {
    console.error('Questions API Error:', e);
    // Return empty array instead of crashing the wizard
    return NextResponse.json({ questions: [] });
  }
}

/**
 * Build a feasibility-aware prompt for generating wizard follow-up questions.
 * This does NOT change the response shape – still { questions: Question[] }.
 */
function buildSystemPrompt(input: {
  idea: string;
  productName: string;
  category: string;
  coreProduct: string;
  sourcingMode: string;
  components?: any;
  selectedSubProducts?: any;
}): string {
  const {
    idea,
    productName,
    category,
    coreProduct,
    sourcingMode,
    components,
    selectedSubProducts
  } = input;

  const componentsJson = components
    ? JSON.stringify(components, null, 2)
    : 'null';

  const subsJson = selectedSubProducts
    ? JSON.stringify(selectedSubProducts, null, 2)
    : '[]';

  return `
You are ManuBot, a senior New Product Introduction (NPI) program manager.

Your job is to generate EXACTLY 5 laser-focused follow-up questions that will help us:
- Understand how hard this product will be to manufacture
- Understand the real cost and MOQ realities
- Understand compliance / safety / risk
- Understand how this product is different from standard or white-label options
- Understand any logistics issues such as weight or fragility

The user has already told us:

- Idea / high-level concept:
  "${idea}"

- Product name:
  "${productName}"

- Category:
  "${category}"

- Core product description (plain text):
  "${coreProduct}"

- Sourcing mode:
  "${sourcingMode}"   // "white_label", "custom", or similar

- Components (serialised JSON from the wizard):
${componentsJson}

- Selected sub-products (serialised JSON):
${subsJson}

=====================================================
WHAT YOU MUST DO
=====================================================

Generate 5 follow-up questions that together cover:

1) MANUFACTURABILITY & TOOLING  (at least 2 questions)
   Examples of what to ask:
   - What materials and manufacturing processes do they expect (sheet metal, casting, injection moulding, textiles, electronics, etc.)?
   - Will this design require new moulds or tooling, or can factories use an existing BBQ / product as the base?

2) COST & MOQ REALITY  (at least 1 question)
   - Ask about the kind of MOQ they are realistically comfortable with for the first order,
     and whether they expect a low, medium or high ex-factory cost relative to the market.

3) COMPLIANCE & RISK  (at least 1 question)
   - Ask about food contact, electrical components, gas, sharp edges, children, outdoor use or any regulated aspects.
   - The goal is to understand whether compliance is Basic, Moderate or Strict.

4) DIFFERENTIATION / UNIQUENESS  (at least 1 question)
   - Ask explicitly how their product will differ from what is already available.
   - Distinguish between:
       • logo / colour only
       • minor design tweaks (handles, vents, shelves, accessories)
       • new features or components added to an existing base
       • totally new design or new way of using the product.
   - This is critical for understanding competition intensity and uniqueness.

5) LOGISTICS / FRAGILITY  (optional but preferred)
   - Where relevant, ask about expected size, weight, and fragility
     (for example, very heavy, delicate glass components, sensitive electronics, etc.).

You can reference the idea, core product, components and sourcing mode to make the questions specific
(e.g. "For this charcoal BBQ…" or "For this knife set…") instead of generic.

=====================================================
OUTPUT FORMAT (CRITICAL)
=====================================================

Return ONLY a single JSON object with one key: "questions".

"questions" MUST be an array of EXACTLY 5 question objects.
Each question object MUST have:

- "key": a short, machine-readable id (e.g. "tooling_requirements")
- "label": a short UI label (e.g. "Tooling & moulds")
- "title": the full human-readable question to show above the input
- "helper": a short helper line explaining what to include in the answer
- "placeholder": an example answer
- "suggestedAnswer": (optional) a realistic sample answer

Example STRUCTURE (do not reuse this content literally):

{
  "questions": [
    {
      "key": "tooling_requirements",
      "label": "Tooling & moulds",
      "title": "Will this design need new moulds or tooling, or can factories use an existing BBQ or product as the base?",
      "helper": "Explain whether you expect a brand new shape or mechanism, or if this is mostly a cosmetic change to an existing product.",
      "placeholder": "We want to use a standard 57 cm kettle BBQ body and lid, but add our own handle design and vent cap. No new major tooling beyond a logo plate.",
      "suggestedAnswer": "We plan to start with an existing compact charcoal BBQ frame and add our own fold-out side tables and thermometer in the lid."
    }
  ]
}

IMPORTANT RULES:
- Do NOT ask about things already fully clear from the input, unless a clarification is needed.
- Questions must be practical and specific, not generic.
- Keep everything in clear, simple English.
- Do NOT output any text outside the JSON object.
`.trim();
}
