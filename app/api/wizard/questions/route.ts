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
        sourcingMode 
    } = body;

    // --- SMART BRANCHING PROMPT ---
    const prompt = `
    You are a senior manufacturing engineer. 
    Product: "${productName}" (${category})
    Context: "${idea}"
    Sourcing Mode: ${sourcingMode} (White Label vs Custom)

    Generate 3 highly specific technical questions to uncover hidden manufacturing risks.
    
    CRITICAL BRANCHING LOGIC:
    - If Category is "Electronics": Ask about PCB design status (Gerber files), Firmware readiness, or Battery certification needs.
    - If Category is "Soft Goods" (Apparel/Bags): Ask about Tech Packs, fabric weight (GSM), or pattern files.
    - If Category is "Plastic/Hardware": Ask about 3D CAD format (STEP/IGES), mold flow analysis, or surface finish (VDI/SPI).
    - If Sourcing Mode is "White Label": Ask about logo placement, packaging customization, or specific color matching (Pantone).

    Output JSON:
    {
      "questions": [
        {
          "key": "short_id",
          "label": "Short Label",
          "title": "The Question",
          "helper": "Why we are asking this (explain the risk).",
          "placeholder": "Example answer...",
          "suggestedAnswer": "A helpful default if applicable"
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Output valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return NextResponse.json(JSON.parse(content));

  } catch (e: any) {
    return NextResponse.json({ questions: [] });
  }
}