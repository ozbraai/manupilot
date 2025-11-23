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
      costEstimate
    } = body;

    const market = constraints?.markets || 'US';
    const targetPrice = constraints?.maxUnitPrice || 'Not set';

    const systemPrompt = `
    You are a Senior NPI (New Product Introduction) Program Manager.
    Your goal is to produce a BRUTALLY REALISTIC manufacturing plan and engineering breakdown.
    
    Context:
    Product: "${productName}"
    Category: "${category}"
    Market: "${market}"
    Mode: ${sourcingMode === 'white-label' ? 'White Label (Off-the-shelf)' : 'Custom Design (New Tooling)'}
    Target Cost: ${targetPrice}

    Your task is to generate a JSON Playbook that impresses an industry veteran.

    RULES FOR "COMPLEXITY TIER":
    - Determine if this is TIER 1 (Simple/Accessories), TIER 2 (Consumer Electronics), or TIER 3 (Automotive/Medical/Robotics).
    
    RULES FOR TIMELINE (The "NPI" Standard):
    - If TIER 1 (Simple): Timeline = 3-6 Months. Focus: Sampling -> Packaging -> Order.
    - If TIER 2 (Electronics): Timeline = 9-12 Months. Focus: PCB Layout -> EVT -> DVT -> PVT -> Certs.
    - If TIER 3 (Automotive/Complex): Timeline = 2-4 YEARS. 
      * Must include: "Clay Modeling", "Class A Surfacing", "Chassis Engineering", "Homologation/Road Legal Testing", "Crash Testing".
      * DO NOT say "Month 1". Use "Q1-Q2: Concept", "Year 2: Tooling", etc.

    RULES FOR FINANCIALS:
    - "Unit Economics": Cost to make ONE. (BOM + Labor + Scrap rate).
    - "Startup Capital": One-off costs (NRE). 
      * For a CAR: Tooling is $10M+, Crash testing is $500k+, Prototyping is $2M+. Be realistic.
      * For a BBQ: Tooling is $30k-$50k.
      * If White Label: Tooling is <$2k (Packaging only).
    - "Hidden Costs": Add things users forget (e.g. "3PL Setup fees", "Liability Insurance", "Defect rate allowance").

    RULES FOR BOM (Bill of Materials):
    - Break the product down into 4-8 main sub-assemblies or parts.
    - Guess the likely Manufacturing Process (e.g. 'Injection Molding', 'Die Casting', 'Cut & Sew', 'PCB Assembly').
    - Be specific on materials (e.g. 'ABS Plastic', '304 Stainless Steel', 'Li-Ion Cell').

    Output STRICT JSON:
    {
      "playbook": {
        "productName": "${productName}",
        "free": {
          "summary": "Professional executive summary.",
          "targetCustomer": "Specific persona.",
          "materials": ["Mat 1", "Mat 2"],
          "keyFeatures": ["Feat 1", "Feat 2"],
          
          "financials": {
            "complexityTier": "TIER X",
            "unitEconomics": {
                "exWorksCost": "Factory Price",
                "freightCost": "Shipping per unit",
                "landedCost": "Total Cost in Warehouse",
                "retailPrice": "Realistic RRP",
                "grossMargin": "Margin %"
            },
            "startupCapital": {
                "tooling": "Molds/Dies cost",
                "prototyping": "R&D fees",
                "certification": "Testing costs",
                "firstBatchCost": "Inventory cost",
                "totalLaunchBudget": "Total Cash Required"
            },
            "hiddenCosts": ["Hidden Cost 1", "Hidden Cost 2"],
            "logisticDetails": {
                "tariffCode": "HS Code",
                "dutyRate": "Duty %"
            }
          },

          "bomDraft": [
            {
              "partName": "Part Name (e.g. 'Casing')",
              "material": "Material (e.g. 'ABS Plastic')",
              "process": "Mfg Process (e.g. 'Injection Molding')",
              "qty": 1
            },
            {
              "partName": "Part Name",
              "material": "Material",
              "process": "Process",
              "qty": 1
            }
          ],

          "manufacturingApproach": {
             "approach": [
                "Strategy 1 (e.g. Modular assembly to reduce shipping volume)", 
                "Strategy 2 (e.g. Use off-the-shelf powertrain to save R&D)"
             ],
             "risks": [
                "Specific Risk 1 (e.g. 'Homologation failure in EU')", 
                "Specific Risk 2 (e.g. 'High scrap rate on aluminum panels')"
             ],
             "dfmWarnings": ["Warning 1", "Warning 2"],
             "complianceTasks": ["Regulatory 1", "Regulatory 2"]
           },
           
          "timeline": [
            "Stage 1: [Name] - [Detail]",
            "Stage 2: [Name] - [Detail]"
          ],

          "nextSteps": ["Immediate Action 1", "Immediate Action 2"],
          
          "manufacturingRegions": ["Region 1", "Region 2"],
          "regionRationale": "Why?"
        }
      }
    }
    `;

    // PARALLEL EXECUTION: Generate text playbook AND blueprint image simultaneously
    const [completion, imageResponse] = await Promise.all([
      // Text Generation
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context: ${idea}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),

      // Image Generation (Blueprint)
      openai.images.generate({
        model: 'dall-e-3',
        prompt: `A professional technical blueprint drawing of a ${productName || idea}. Style: Architectural blueprint, white technical lines on a classic dark blue grid background. View: Isometric or exploded view. Aesthetic: Clean, precise, engineering diagram, schematic, vector style. No text labels.`,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })
    ]);

    const json = JSON.parse(completion.choices[0]?.message?.content || '{}');

    if (!json.playbook) json.playbook = { free: {} };
    if (!json.playbook.free) json.playbook.free = {};

    // Process the generated image
    let finalImageUrl = imageResponse.data?.[0]?.url || null;

    // Upload to Supabase Storage for persistence
    if (finalImageUrl) {
      try {
        // Download the image from OpenAI
        const imageBuffer = await fetch(finalImageUrl).then(res => res.arrayBuffer());

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = (productName || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${sanitizedName}_${timestamp}.png`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError && uploadData) {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

          finalImageUrl = publicUrl;
          console.log('✅ Image uploaded to Supabase:', publicUrl);
        } else {
          console.warn('⚠️ Supabase upload failed, using OpenAI URL:', uploadError);
        }
      } catch (uploadErr) {
        console.error('Image upload error:', uploadErr);
        // Fallback to OpenAI URL if upload fails
      }
    }

    // Inject image URL into playbook
    json.playbook.free.projectImage = finalImageUrl;

    // Default component data
    json.playbook.free.components = {
      estimatedComponentCount: 0,
      subProducts: [],
      componentList: componentsInfo?.components ? Object.values(componentsInfo.components).flat() : [],
      supplierTypes: componentsInfo?.supplierTypes || [],
      notes: "Data from wizard."
    };

    // Fallback roadmap if AI fails
    if (!json.playbook.free.roadmapPhases) {
      json.playbook.free.roadmapPhases = [
        { id: 'p1', name: 'Engineering Validation (EVT)', tasks: ['Functional Prototype', 'Lab Testing'] },
        { id: 'p2', name: 'Design Validation (DVT)', tasks: ['Hard Tooling', 'Certification'] }
      ];
    }

    json.playbook.sourcingMode = sourcingMode;
    json.playbook.category = category;

    return NextResponse.json(json);

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate playbook' }, { status: 500 });
  }
}