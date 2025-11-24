import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Supabase client for server-side storage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      idea,
      productName,
      category,
      sourcingMode,
      constraints,
      componentsInfo,
      costEstimate,
      selectedSubProducts,
      questions,
      answers
    } = body;

    const market = constraints?.markets || 'US';
    const targetPrice = constraints?.maxUnitPrice || 'Not set';
    const mode = sourcingMode === 'white-label' ? 'White Label' : 'Custom Design';

    const systemPrompt = `
You are a Senior NPI (New Product Introduction) Program Manager.
Your goal is to produce a BRUTALLY REALISTIC manufacturing plan.

Context:
Product: "${productName}"
Category: "${category}"
Market: "${market}"
Mode: ${mode}
Target Cost: ${targetPrice}

Generate a JSON PlaybookV2 object.

RULES:
- "summary": Professional executive summary (2-3 sentences).
- "targetCustomer": Specific persona.
- "keyFeatures": 3-5 distinct selling points.
- "materials": Specific materials (e.g. "304 Stainless Steel", "ABS Plastic").
- "manufacturingApproach":
  - "approach": Array of 3-5 specific manufacturing strategy steps/recommendations.
  - "recommendedRegions": e.g. ["Shenzhen, China", "Vietnam"]
  - "rationale": Why these regions?
  - "risks": Specific manufacturing risks.
- "pricing":
  - "positioning": e.g. "Premium", "Mid-range", "Budget"
  - "insight": Why this pricing strategy works.
- "timeline": 4-6 high-level phases (e.g. "Phase 1: Prototyping (2 months)").
- "nextSteps": 3 immediate actions for the founder.

Output STRICT JSON:
{
  "free": {
    "summary": "...",
    "targetCustomer": "...",
    "keyFeatures": ["..."],
    "materials": ["..."],
    "manufacturingApproach": {
      "approach": ["...", "...", "..."],
      "recommendedRegions": ["..."],
      "rationale": "...",
      "risks": ["..."]
    },
    "pricing": {
      "positioning": "...",
      "insight": "..."
    },
    "timeline": ["..."],
    "nextSteps": ["..."]
  }
}
`;

    // PARALLEL EXECUTION: Text + Image
    const [completion, imageResponse] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context: ${idea}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
      openai.images.generate({
        model: 'dall-e-3',
        prompt: `A professional technical blueprint drawing of a ${productName || idea}. Style: Architectural blueprint, white technical lines on a classic dark blue grid background. View: Isometric or exploded view. Aesthetic: Clean, precise, engineering diagram, schematic, vector style. No text labels.`,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })
    ]);

    const aiContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const freeContent = aiContent.free || {};

    // Image Processing
    let finalImageUrl = imageResponse.data?.[0]?.url || null;
    if (finalImageUrl) {
      try {
        const imageBuffer = await fetch(finalImageUrl).then(res => res.arrayBuffer());
        const timestamp = Date.now();
        const sanitizedName = (productName || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${sanitizedName}_${timestamp}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);
          finalImageUrl = publicUrl;
        }
      } catch (uploadErr) {
        console.error('Image upload error:', uploadErr);
      }
    }

    // Construct PlaybookV2
    const playbook = {
      productName,
      mode: sourcingMode,
      category,
      coreProduct: componentsInfo?.coreProduct || productName,
      subProducts: selectedSubProducts || [],
      componentsInfo: {
        components: componentsInfo?.components || {},
        supplierTypes: componentsInfo?.supplierTypes || []
      },
      constraints: constraints || {},
      costEstimate: costEstimate || {},
      free: {
        ...freeContent,
        projectImage: finalImageUrl, // Add image to free content for UI compatibility
        // Backward compatibility fields for existing UI if needed
        manufacturingRegions: freeContent.manufacturingApproach?.recommendedRegions || [],
        regionRationale: freeContent.manufacturingApproach?.rationale || '',
        risks: freeContent.manufacturingApproach?.risks || [],
      },
      premium: {}
    };

    return NextResponse.json({ playbook });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate playbook' }, { status: 500 });
  }
}