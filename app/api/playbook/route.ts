// app/api/playbook/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, productName, questions, answers } = body || {};

    if (!idea) {
      return NextResponse.json(
        { error: 'Missing idea input.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured.' },
        { status: 500 }
      );
    }

    // --- Build founder Q&A text for context ---
    const qaText =
      Array.isArray(questions) && answers
        ? questions
            .map((q: any, idx: number) => {
              const key = q.key;
              const answer = answers[key] || '';
              return `Q${idx + 1}: ${q.title}\nA${idx + 1}: ${answer}`;
            })
            .join('\n\n')
        : '';

    // --- Prompt that includes components block ---
    const prompt = `
You are ManuBot, an expert manufacturing strategist.

You will receive:
- A product idea
- A short product name
- The founder's answers to some clarifying questions

Your job is to generate a FREE manufacturing playbook in **strict JSON**.

The playbook must be tailored to the specific product category (e.g. knives, camping gear, electronics, toys, kitchen tools, etc.).

----------------------------------------
JSON STRUCTURE TO OUTPUT
----------------------------------------

{
  "productName": "string",
  "free": {
    "summary": "string",
    "targetCustomer": "string",
    "keyFeatures": ["..."],
    "materials": ["..."],
    "manufacturingApproach": {
      "recommendedRegions": ["..."],
      "rationale": "string",
      "risks": ["..."]
    },
    "pricing": {
      "positioning": "string",
      "insight": "string"
    },
    "timeline": ["..."],
    "nextSteps": ["..."],
    "roadmapPhases": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "tasks": ["task 1", "task 2", "task 3"]
      }
    ],
    "components": {
      "estimatedComponentCount": 0,
      "subProducts": ["..."],
      "componentList": ["..."],
      "supplierTypes": ["..."],
      "notes": "string"
    }
  }
}

----------------------------------------
HOW TO THINK ABOUT COMPONENTS
----------------------------------------
- Break the described product into logical physical components and sub-products.
- Identify the core product and any obvious add-ons or accessories.
- Think like a manufacturing engineer:
  - What separate parts must be produced?
  - Which parts are usually handled by different suppliers?
  - What is a realistic component breakdown for this category?

Examples of thinking (DO NOT output these exact texts):

- For a motorised rotisserie:
  - Components: motor housing, spit rod, forks, fasteners, heat shield, carry bag.
  - Supplier types: metal fabrication, motor / electronics assembly, textile / bag maker.

- For a folding camping table:
  - Components: frame, legs, hinges, tabletop, screws, carry bag.
  - Supplier types: metal fabrication, woodworking / board supplier, textile / bag maker.

- For a chef knife:
  - Components: blade, handle scales, pins, sheath, packaging.
  - Supplier types: knife forge / blade maker, handle shop, sheath maker, packaging supplier.

Make sure components is always filled with **realistic guesses** even if the founder didn't mention them explicitly. You are allowed to infer common sense things like boxes, carry bags, screws, hinges, etc.

----------------------------------------
INPUT CONTEXT
----------------------------------------

Idea:
"${idea}"

Short product name:
"${productName || ''}"

Founder Q&A:
${qaText}

----------------------------------------
TASK
----------------------------------------
Return ONLY the JSON object described above. No commentary, no markdown, no extra text.
`;

    // --- Call OpenAI Chat Completions ---
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 1800,
      }),
    });

    const raw = await openaiRes.text();
    // Helpful for debugging if needed:
    // console.log('OpenAI raw response for /api/playbook:', raw);

    if (!openaiRes.ok) {
      console.error('OpenAI error:', raw);
      return NextResponse.json(
        { error: 'AI failed to generate playbook.' },
        { status: 500 }
      );
    }

    let playbook: any = null;

    try {
      // Because we used response_format: json_object,
      // the `raw` body itself should be valid JSON with the JSON object in `choices[0].message.content`.
      const parsed = JSON.parse(raw);
      const content = parsed.choices?.[0]?.message?.content || '{}';
      playbook = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI JSON for playbook:', e, raw);
      return NextResponse.json(
        { error: 'AI response was not valid JSON.' },
        { status: 500 }
      );
    }

    // Optionally ensure we keep the productName consistent
    if (!playbook.productName && productName) {
      playbook.productName = productName;
    }

    return NextResponse.json({ playbook });
  } catch (e: any) {
    console.error('Playbook route error:', e);
    return NextResponse.json(
      { error: 'Failed to generate playbook.' },
      { status: 500 }
    );
  }
}