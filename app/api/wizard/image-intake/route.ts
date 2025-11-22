// /app/api/wizard/image-intake/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return buffer.toString('base64');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    const idea = String(formData.get('idea') || '').trim();
    const productName = String(formData.get('productName') || '').trim();
    const category = String(formData.get('category') || '').trim();

    if (!(image instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image file received' },
        { status: 400 }
      );
    }

    const base64Image = await blobToBase64(image);

    const systemPrompt = `
You are ManuBot, an AI assistant that helps creators manufacture products.

You will receive:
- An optional existing idea text
- An optional existing productName
- An optional category
- A single product reference image

Your job is to:
1. Infer what the product is and how it is used.
2. Guess the likely category and core product name.
3. Identify key components and any obvious sub-products or variants.
4. Estimate how suitable this product is for white labelling.
5. Return STRICT JSON in the following structure:

{
  "improvedIdea": "string - a cleaned up description of the product and how it is used (2-4 sentences)",
  "productName": "short working name, 3-8 words",
  "componentsInfo": {
    "coreProduct": "string",
    "category": "string",
    "subProducts": [
      { "id": "short-id-1", "label": "Sub product label", "description": "optional" }
    ],
    "components": {
      "Structure / frame": ["item 1", "item 2"],
      "Electrics / control": ["item 3"]
    },
    "supplierTypes": [
      "BBQ and grilling manufacturer",
      "Metal fabrication factory"
    ],
    "whiteLabelSuitability": {
      "score": 0.0,
      "reason": "Explain in 1–2 sentences why this is or is not suitable for white labelling.",
      "typicalChanges": ["logo and colour", "logo + packaging"],
      "examples": ["BBQ rotisserie kit", "generic camp grill"]
    }
  }
}

Rules:
- You MUST output valid JSON only. No commentary, no markdown.
- If you are not sure about something, make a reasonably safe guess rather than leaving it out.
- Keep arrays to a sensible size (3–8 items per list).
- Use British/Australian spelling for words like "colour".
`;

    const userPrompt = `
Existing idea text (may be empty):
${idea || '(none provided)'}

Existing product name (may be empty):
${productName || '(none provided)'}

Existing category hint (may be empty):
${category || '(none provided)'}

Now analyse the attached image and refine this into clean structured JSON.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: 'No response from vision model' },
        { status: 500 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('Image-intake JSON parse error:', raw);
      return NextResponse.json(
        { error: 'Model returned invalid JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (err: any) {
    console.error('Image-intake route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected error in image-intake route' },
      { status: 500 }
    );
  }
}