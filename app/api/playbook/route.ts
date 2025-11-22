// app/api/playbook/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Question = {
  key: string;
  label: string;
  title: string;
  helper: string;
  placeholder: string;
  suggestedAnswer?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      idea,
      productName,
      category,
      coreProduct,
      componentsInfo,
      selectedSubProducts,
      questions,
      answers,
      constraints,
      costEstimate,
      sourcingMode,
    } = body as {
      idea: string;
      productName: string;
      category?: string;
      coreProduct?: string;
      componentsInfo?: any;
      selectedSubProducts?: any[];
      questions?: Question[];
      answers?: Record<string, string>;
      constraints?: any;
      costEstimate?: any;
      sourcingMode?: 'white-label' | 'custom' | 'auto';
    };

    const safeCategory = category || 'general product';
    const safeCoreProduct = coreProduct || productName || idea || 'the product';
    const mode: 'white-label' | 'custom' =
      sourcingMode === 'white-label' ? 'white-label' : 'custom';

    const systemPrompt = `
You are ManuBot, an expert manufacturing playbook generator for ManuPilot.

Your job is to take the user's idea, clarified details, constraints and sourcing mode,
and output a structured playbook object plus a phased roadmap.

You must output STRICT JSON with this shape:

{
  "playbook": {
    "productName": "short name",
    "category": "product category",
    "sourcingMode": "white-label" or "custom",
    "free": {
      "summary": "2–3 paragraphs describing what the product is and what the founder is trying to achieve.",
      "targetCustomer": "Who this is for and why they care.",
      "materials": "Key materials and finishes you recommend.",
      "features": "Headline features and any variants/sub-products that matter.",
      "approach": "High-level sourcing and manufacturing approach.",
      "risks": "Realistic risks and trade-offs the founder should know.",
      "timeline": "High-level timeline expectations and key gates.",
      "nextSteps": "3–7 immediate, concrete actions."
    },
    "roadmapPhases": [
      {
        "id": "phase_1",
        "title": "Phase title",
        "description": "1–2 sentence overview.",
        "tasks": [
          {
            "id": "task_1",
            "title": "Task title",
            "detail": "What needs to be done and why.",
            "ownerHint": "Founder / sourcing agent / engineer / designer"
          }
        ]
      }
    ]
  }
}

White label behaviour (sourcingMode = "white-label"):
- Assume the core product already exists in factories.
- Focus the approach, risks, and roadmap on:
  - clarifying minimum acceptable quality
  - selecting and shortlisting suppliers
  - requesting and comparing samples
  - tweaking spec where it is realistic (colour, finish, accessories, packaging)
  - branding, packaging, labelling and inserts
  - basic compliance and product safety for markets mentioned
- Do NOT pretend they are re-inventing the product mechanically.

Custom behaviour (sourcingMode = "custom"):
- Assume the user wants something meaningfully different or new.
- Focus the approach, risks and roadmap on:
  - defining functional goals and differentiation vs existing products
  - drawings and engineering (what exists, what is missing)
  - prototypes and iteration
  - tooling decisions and amortisation
  - deeper QC and pre-production checks
  - IP (design registration, patents) where relevant

General rules:
- Use British/Australian spelling where it matters (colour, metre).
- Be concrete and practical, not academic.
- Do not mention "sourcingMode" directly to the user; instead adjust tone and content.
- Keep phases to 5–7 total, each with 3–6 tasks.
- Tailor everything to the specific product, idea, components and constraints provided.
`;

    const componentsSummary = componentsInfo?.components
      ? Object.entries(componentsInfo.components as Record<string, string[]>)
          .map(([section, items]) => `${section}: ${items.join(', ')}`)
          .join(' | ')
      : '(none)';

    const subProductsSummary =
      selectedSubProducts && selectedSubProducts.length
        ? selectedSubProducts.map((sp: any) => sp.label || sp.id).join(', ')
        : '(none)';

    const qAndA =
      questions && questions.length
        ? questions
            .map((q) => {
              const val = (answers && answers[q.key]) || '';
              return `Q: ${q.title}\nA: ${val}`;
            })
            .join('\n\n')
        : '(no additional questions answered)';

    const constraintsSummary = constraints
      ? JSON.stringify(constraints, null, 2)
      : '(none)';
    const costSummary = costEstimate
      ? JSON.stringify(costEstimate, null, 2)
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

sourcingMode:
${mode}

componentsInfo (raw JSON):
${JSON.stringify(componentsInfo || {}, null, 2)}

components summary:
${componentsSummary}

selectedSubProducts:
${subProductsSummary}

constraints (JSON):
${constraintsSummary}

costEstimate (JSON):
${costSummary}

Follow up questions and answers:
${qAndA}

Now generate the playbook JSON.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.35,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: 'No response from AI when generating playbook' },
        { status: 500 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('Playbook route JSON parse error:', raw);
      return NextResponse.json(
        { error: 'Model returned invalid JSON when generating playbook' },
        { status: 500 }
      );
    }

    if (!json.playbook) {
      return NextResponse.json(
        { error: 'Model did not return a playbook object' },
        { status: 500 }
      );
    }

    // Light sanity patch
    json.playbook.productName = json.playbook.productName || productName || safeCoreProduct;
    json.playbook.category = json.playbook.category || safeCategory;
    json.playbook.sourcingMode = mode;

    return NextResponse.json(json);
  } catch (err: any) {
    console.error('Playbook route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error in playbook route' },
      { status: 500 }
    );
  }
}