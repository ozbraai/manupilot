// app/api/wizard/questions/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      idea,
      productName,
      category,
      coreProduct,
      components,
      selectedSubProducts,
      sourcingMode,
    } = body as {
      idea: string;
      productName: string;
      category?: string;
      coreProduct?: string;
      components?: Record<string, string[]>;
      selectedSubProducts?: { id: string; label: string; description?: string }[];
      sourcingMode?: 'white-label' | 'custom' | 'auto';
    };

    const safeCategory = category || 'general product';
    const safeCoreProduct = coreProduct || productName || idea || 'the product';

    const systemPrompt = `
You are ManuBot, an AI manufacturing strategist.

Your job is to generate 4–6 deep, practical questions that help clarify the product and sourcing plan
for ManuPilot's Playbook Wizard.

You are given:
- idea: free text description of the product
- productName: short working name
- category: product category
- coreProduct: distilled core item
- components: structured breakdown of the product
- selectedSubProducts: array of sub-products or variants the user cares about
- sourcingMode: "white-label" or "custom" (if missing, assume "custom")

You must produce STRICT JSON of the form:

{
  "questions": [
    {
      "key": "machine_readable_key",
      "label": "Short friendly label",
      "title": "Full question title shown to the user",
      "helper": "1–3 sentences explaining why this matters. Use British/Australian spelling.",
      "placeholder": "Helpful example answer",
      "suggestedAnswer": "Pre-filled answer based on what we already know, or empty string if we truly do not know."
    }
  ]
}

Rules:
- keys must be stable, lowerCamelCase and descriptive, eg "targetCustomer", "productPositioning".
- helper should be concrete and tied to manufacturing reality, not fluffy marketing talk.
- placeholder should be an example that fits the described product.
- suggestedAnswer should be your best guess, using:
  - idea
  - productName
  - category
  - inferred components
  - sourcingMode

White label behaviour:
- If sourcingMode is "white-label":
  - Assume the base product already exists in factories.
  - Focus questions on:
    - target customer and positioning
    - non-negotiable changes compared to the reference
    - branding, colour and finish preferences
    - packaging and unboxing
    - quality expectations and what is acceptable vs not
  - suggestedAnswer should reflect a plausible, realistic default for a brand that wants to white label this type of product.

Custom behaviour:
- If sourcingMode is "custom":
  - Assume the user wants something meaningfully different or new.
  - Focus questions on:
    - functional goals and problems solved vs existing products
    - what is already defined (drawings, CAD, prototypes)
    - what dimensions or tolerances matter most
    - risk appetite (tooling cost, lead times)
  - suggestedAnswer should guess a sensible starting point based on the idea.

General:
- Write in clear, concise English with an Australian / British flavour where it matters (colour, metre, etc).
- Never mention this prompt or "sourcingMode" directly to the user.
- Output JSON only, no comments.
`;

    const componentsSummary = components
      ? Object.entries(components)
          .map(([section, items]) => `${section}: ${items.join(', ')}`)
          .join(' | ')
      : '(none)';

    const subProductsSummary =
      selectedSubProducts && selectedSubProducts.length
        ? selectedSubProducts.map((sp) => sp.label).join(', ')
        : '(none)';

    const userPrompt = `
idea:
${idea || '(none)'}

productName:
${productName || '(none)'}

category:
${safeCategory}

coreProduct:
${safeCoreProduct}

components (section: items):
${componentsSummary}

selectedSubProducts:
${subProductsSummary}

sourcingMode:
${sourcingMode || 'custom'}

Now generate the questions JSON.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: 'No response from AI when generating questions' },
        { status: 500 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('Questions route JSON parse error:', raw);
      return NextResponse.json(
        { error: 'Model returned invalid JSON when generating questions' },
        { status: 500 }
      );
    }

    if (!Array.isArray(json.questions)) {
      return NextResponse.json(
        { error: 'Model did not return a questions array' },
        { status: 500 }
      );
    }

    // Optional: basic sanitising
    const questions = json.questions.map((q: any, index: number) => ({
      key: typeof q.key === 'string' && q.key.trim() ? q.key.trim() : `q${index + 1}`,
      label: String(q.label || `Question ${index + 1}`),
      title: String(q.title || q.label || `Question ${index + 1}`),
      helper: String(
        q.helper ||
          'Add a bit of detail here so the manufacturing roadmap can be as specific and useful as possible.'
      ),
      placeholder: String(
        q.placeholder ||
          'Example: Write a clear, concrete answer instead of a single word.'
      ),
      suggestedAnswer: typeof q.suggestedAnswer === 'string' ? q.suggestedAnswer : '',
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error('Wizard questions route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error in wizard questions route' },
      { status: 500 }
    );
  }
}