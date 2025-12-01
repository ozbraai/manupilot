
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  SourcingMode,
  ComponentsInfo,
  SubProduct,
  Constraints,
  CostEstimate,
  Question,
  Answers
} from '@/types/playbook';
import {
  FeasibilityFeatures,
  FeasibilityScores,
  calculateFeasibility,
  UniquenessFactor
} from '@/lib/feasibility';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type PlaybookRequestBody = {
  idea: string;
  productName?: string;
  category?: string;
  coreProduct?: string;
  sourcingMode?: SourcingMode;
  componentsInfo?: ComponentsInfo;
  components?: any; // backwards compatibility
  selectedSubProducts?: SubProduct[];
  constraints?: Constraints;
  costEstimate?: CostEstimate;
  questions?: Question[];
  answers?: Answers;
  differentiationText?: string;
  // NEW FIELDS
  designStage?: string;
  referenceLink?: string;
  selectedSimilarProductId?: string;
  keyCharacteristics?: string[];
  feasibilityInputs?: FeasibilityFeatures;
  uniquenessFactor?: UniquenessFactor;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlaybookRequestBody;

    const {
      idea,
      productName,
      category,
      coreProduct,
      sourcingMode = 'auto',
      componentsInfo,
      components,
      selectedSubProducts = [],
      constraints,
      costEstimate,
      questions = [],
      answers = {},
      differentiationText,
      designStage,
      referenceLink,
      selectedSimilarProductId,
      keyCharacteristics,
      feasibilityInputs,
      uniquenessFactor
    } = body;

    // Prefer the newer componentsInfo if present, otherwise fall back
    const componentsContext = componentsInfo ?? components ?? null;

    // 1. Calculate Feasibility Snapshot
    // If we have inputs from the wizard analysis, use them directly.
    // Otherwise, we might need to ask AI to generate them (fallback), but the new flow guarantees them.
    let feasibilitySnapshot: FeasibilityScores | null = null;
    let finalFeasibilityFeatures = feasibilityInputs;

    if (feasibilityInputs) {
      try {
        feasibilitySnapshot = calculateFeasibility(feasibilityInputs);
      } catch (err) {
        console.error('Error calculating feasibility from inputs:', err);
      }
    }

    const systemPrompt = buildSystemPrompt({
      idea,
      productName,
      category,
      coreProduct,
      sourcingMode,
      componentsContext,
      selectedSubProducts,
      constraints,
      costEstimate,
      questions,
      answers,
      differentiationText,
      designStage,
      referenceLink,
      selectedSimilarProductId,
      keyCharacteristics,
      hasFeasibilityInputs: !!feasibilityInputs,
      uniquenessFactor
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content:
            'You are ManuBot, a senior NPI program manager. You ALWAYS respond with valid JSON only.'
        },
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? '{}';

    let parsed: {
      playbook?: any;
      roadmapPhases?: any[];
      feasibilityFeatures?: FeasibilityFeatures;
    };

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse JSON from OpenAI in /api/playbook:', err, content);
      return NextResponse.json(
        {
          error: 'Failed to parse JSON playbook from AI.',
          raw: content
        },
        { status: 500 }
      );
    }

    const playbook = parsed.playbook ?? {};
    const roadmapPhases = parsed.roadmapPhases ?? [];

    // If we didn't have inputs, maybe AI generated them now?
    if (!feasibilitySnapshot && parsed.feasibilityFeatures) {
      finalFeasibilityFeatures = parsed.feasibilityFeatures;
    }

    // INJECT SOURCING MODE & UNIQUENESS
    if (finalFeasibilityFeatures) {
      if (sourcingMode) {
        finalFeasibilityFeatures = { ...finalFeasibilityFeatures, sourcingMode };
      }
      if (uniquenessFactor) {
        finalFeasibilityFeatures = { ...finalFeasibilityFeatures, uniquenessFactor };
      }
    }

    // SYNC: Ensure Feasibility Snapshot regions match the Playbook's recommended regions
    // The Playbook AI (GPT-4o) has better context for specific region recommendations than the initial analysis.
    if (playbook?.manufacturingApproach?.recommendedRegions?.length > 0 && finalFeasibilityFeatures) {
      const recommendedRegions: string[] = playbook.manufacturingApproach.recommendedRegions;

      // Map string regions to RegionSuitability objects
      // We give the first one 95 suitability, others decreasing
      const newTypicalRegions = recommendedRegions.map((region, idx) => ({
        region: region,
        suitability: Math.max(95 - (idx * 10), 60), // 95, 85, 75...
        notes: idx === 0 ? "Primary recommended hub." : "Alternative hub."
      }));

      // Override the typicalRegions in the features
      finalFeasibilityFeatures = {
        ...finalFeasibilityFeatures,
        typicalRegions: newTypicalRegions
      };
    }

    // Recalculate snapshot with the synced regions
    if (finalFeasibilityFeatures) {
      feasibilitySnapshot = calculateFeasibility(finalFeasibilityFeatures);
    }

    // Attach feasibility to playbook object as requested
    if (playbook) {
      playbook.feasibilitySnapshot = feasibilitySnapshot;
    }

    return NextResponse.json({
      playbook,
      roadmapPhases,
      feasibility: feasibilitySnapshot,
      feasibilityFeatures: finalFeasibilityFeatures
    });
  } catch (error: any) {
    console.error('Playbook API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate playbook.'
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(input: {
  idea: string;
  productName?: string;
  category?: string;
  coreProduct?: string;
  sourcingMode: SourcingMode;
  componentsContext: any;
  selectedSubProducts: any[];
  constraints?: Constraints;
  costEstimate?: CostEstimate;
  questions: Question[];
  answers: Answers;
  differentiationText?: string;
  designStage?: string;
  referenceLink?: string;
  selectedSimilarProductId?: string;
  keyCharacteristics?: string[];
  hasFeasibilityInputs: boolean;
  uniquenessFactor?: UniquenessFactor;
}): string {
  const {
    idea,
    productName,
    category,
    coreProduct,
    sourcingMode,
    componentsContext,
    selectedSubProducts,
    constraints,
    costEstimate,
    questions,
    answers,
    differentiationText,
    designStage,
    referenceLink,
    selectedSimilarProductId,
    keyCharacteristics,
    hasFeasibilityInputs,
    uniquenessFactor
  } = input;

  const safeIdea = idea ?? '';
  const safeProductName = productName ?? '';
  const safeCategory = category ?? '';
  const safeCore = coreProduct ?? '';
  const safeDifferentiation = differentiationText ?? '';
  const safeDesignStage = designStage ?? 'Idea only';

  const componentsJson = componentsContext
    ? JSON.stringify(componentsContext, null, 2)
    : 'null';

  const subsJson = selectedSubProducts?.length
    ? JSON.stringify(selectedSubProducts, null, 2)
    : '[]';

  const constraintsJson = constraints ? JSON.stringify(constraints, null, 2) : 'null';
  const costEstimateJson = costEstimate
    ? JSON.stringify(costEstimate, null, 2)
    : 'null';

  const qaJson =
    questions && questions.length
      ? JSON.stringify({ questions, answers }, null, 2)
      : 'null';

  return `
You are ManuBot, a senior New Product Introduction (NPI) program manager.
You help founders turn ideas into manufacturable, costed products with a clear roadmap.

You must return a single JSON object with these top-level keys:
- "playbook"
- "roadmapPhases"
${!hasFeasibilityInputs ? '- "feasibilityFeatures" (Generate this if not provided in input)' : ''}

========================================================
INPUT CONTEXT FROM THE WIZARD
========================================================

Idea / high-level concept:
"${safeIdea}"

Product name:
"${safeProductName}"

Category:
"${safeCategory}"

Design Stage:
"${safeDesignStage}"

Reference Link:
"${referenceLink || 'None'}"

Selected Similar Product ID:
"${selectedSimilarProductId || 'None'}"

Key Characteristics:
${JSON.stringify(keyCharacteristics || [])}

Core product description:
"${safeCore}"

  "sourcingMode": "${sourcingMode}"
  "uniquenessFactor": "${uniquenessFactor || 'Not specified'}"

Components & structure:
${componentsJson}

Selected sub-products:
${subsJson}

Constraints:
${constraintsJson}

Cost estimate:
${costEstimateJson}

Follow-up questions + answers:
${qaJson}

Differentiation:
"${safeDifferentiation}"

========================================================
1) PLAYBOOK (FREE CONTENT)
========================================================

RULES FOR MANUFACTURING APPROACH & RISKS:
1. "approach": 3-5 bullets max. Start each with a clear verb (e.g. "Finalise", "Shortlist", "Order", "Sign").
   - IF White Label: Focus on picking catalogue products, ordering samples, checking certifications, negotiating MOQs, branding/packaging.
   - IF Dropshipping: Focus on supplier vetting (AliExpress/CJ/Zendrop), ordering samples for quality check, setting up Shopify/store, marketing assets, testing ads.
   - IF Hybrid: Focus on modifying existing products, documenting changes, understanding tooling impact, running modified samples.
   - IF Custom: Focus on complete drawings/CAD, NDAs, engineering feedback, prototypes, tooling contracts, certification planning.
2. "risks": 2-4 bullets max.
   - IF White Label: Risk of over-customising, weak packaging/labelling, reliance on one factory, brand confusion.
   - IF Dropshipping: Long shipping times, poor quality control, low margins, supplier reliability, difficult returns.
   - IF Hybrid: Risk of underestimating tooling, factories not updating drawings, vendor lock-in.
   - IF Custom: Risk of incomplete drawings, IP/control over tooling, failure to plan for certification, high MOQs.
3. Tone: Friendly, practical, slightly cautious mentor.
4. Dynamic: Use the category ("${safeCategory}") to adapt examples (e.g. electronics -> certifications; food -> shelf-life).

Generate a "playbook" object with the following structure:

{
  "summary": "...",  // Professional executive summary (2-3 sentences)
  "targetCustomer": "...",  // Specific persona
  "keyFeatures": ["...", "..."],  // 3-5 distinct selling points
  "materials": ["304 Stainless Steel", "ABS Plastic", ...],  // Specific materials
  "manufacturingApproach": {
    "approach": ["Verbed action step...", "..."],  // Follow RULES above. Specific to ${sourcingMode}.
    "recommendedRegions": ["Shenzhen, China", "Vietnam", ...],
    "rationale": "...",  // Why these regions?
    "risks": ["Risk 1...", "..."]  // Follow RULES above. Specific to ${sourcingMode}.
  },
  "pricing": {
    "positioning": "Premium" | "Mid-range" | "Budget",
    "insight": "..."  // Why this pricing strategy works
  },
  "financials": {
    "complexityTier": "Low" | "Medium" | "High",
    "unitEconomics": {
      "exWorksCost": "$X.XX",
      "freightCost": "$X.XX",
      "landedCost": "$X.XX",
      "retailPrice": "$X.XX",
      "grossMargin": "XX%"
    },
    "startupCapital": {
      "tooling": "$X,XXX",
      "prototyping": "$X,XXX",
      "certification": "$X,XXX",
      "firstBatchCost": "$X,XXX",
      "totalLaunchBudget": "$XX,XXX",
      "moqBasis": "500 units", // The MOQ used for this calculation
      "industryStandardMOQ": "1,000 - 3,000 units" // Typical for this category
    },
    "hiddenCosts": ["...", "..."],
    "logisticDetails": {
      "tariffCode": "...",
      "dutyRate": "XX%"
    }
  },
  "timeline": ["Phase 1: Prototyping (2 months)", ...],  // 4-6 high-level phases
  "nextSteps": ["...", "...", "..."]  // 3 immediate actions for the founder
}

========================================================
2) ROADMAP PHASES
========================================================

Generate "roadmapPhases": an array of 5–7 phases.
Each phase should have:
- a clear name
- a rough phase goal
- 3–6 concrete tasks

All tasks must be specific to this product. No generic filler like "do marketing".

${!hasFeasibilityInputs ? `
========================================================
3) FEASIBILITY FEATURES (REQUIRED IF NOT PROVIDED)
========================================================

You MUST also generate a "feasibilityFeatures" object with this exact shape:

{
  "productCategory": string,
  "processes": ("sheet_metal" | "welding" | "cnc" | "injection_moulding" | "casting" | "forging" | "textile_sewing" | "electronics_pcba" | "assembly_only")[],
  "partsCount": number,
  "hasElectronics": boolean,
  "requiresCustomTooling": boolean,
  "toolingCostBand": "None" | "Low" | "Medium" | "High",
  "unitCostBand": "Low" | "Medium" | "High",
  "moqBand": "Low" | "Medium" | "High",
  "weightClass": "Light" | "Medium" | "Heavy",
  "fragility": "Low" | "Medium" | "High",
  "complianceLevel": "Basic" | "Moderate" | "Strict",
  "typicalRegions": { "region": string, "suitability": number, "notes": string }[],
  "competitionCategory": "Commodity" | "Brandable" | "Niche",
  "amazonSaturation": "Low" | "Medium" | "High",
  "differentiationDifficulty": "Low" | "Medium" | "High",
  "trendDirection": "Declining" | "Flat" | "Growing" | "Exploding"
}

Use the context (Design Stage, Sourcing Mode, Idea) to fill this realistically.
` : ''}

========================================================
4) FINANCIALS DERIVATION (REQUIRED)
========================================================

You MUST generate the "financials" object. Estimate values based on the product type and feasibility inputs.

- "complexityTier": "Low" (simple assembly), "Medium" (some custom parts), "High" (complex electronics/mechanisms).
- "unitEconomics":
    - "exWorksCost": Estimate factory cost (e.g. $2.50 for simple mug, $15.00 for complex BBQ).
    - "retailPrice": Typically 3x - 5x the Ex-Works cost.
    - "grossMargin": Calculate as ((Retail - Landed) / Retail) * 100. Aim for 60-70%.
- "startupCapital":
    - If "dropshipping": Tooling $0. Focus on samples ($50-$200) and marketing budget.
    - If "white-label": $0 - $500.
    - If "custom" & simple: $2,000 - $5,000.
    - If "custom" & complex: $10,000+.
    - "prototyping": $100 - $2,000 depending on complexity.
    - "totalLaunchBudget": Sum of all startup costs + first batch inventory.

========================================================
OUTPUT FORMAT (CRITICAL)
========================================================

You MUST output ONLY a single JSON object.
Do not include any extra top-level keys.
Do not output prose or commentary outside of JSON.
  `.trim();
}
