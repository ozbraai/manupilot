// app/api/playbook/analyze/route.ts
// Generates deep AI analysis from snapshot (doesn't create project)

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PlaybookSnapshot } from '@/types/playbook';
import type { ProjectAIAnalysis } from '@/types/project';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Build comprehensive deep analysis prompt
function buildDeepAnalysisPrompt(snapshot: PlaybookSnapshot): string {
    const { product_name, category, sourcing_mode, wizard_input, ai_baseline, user_overrides } = snapshot;

    // Use user overrides if available, fallback to AI baseline
    const finalRetail = user_overrides.retailPrice
        ? `$${user_overrides.retailPrice}`
        : ai_baseline.unitEconomics?.retailPrice || 'TBD';

    const finalLanded = user_overrides.landedCost
        ? `$${user_overrides.landedCost}`
        : ai_baseline.unitEconomics?.landedCost || 'TBD';

    const finalMOQ = user_overrides.moq
        ? user_overrides.moq.toString()
        : ai_baseline.startupCapital?.moqBasis || 'TBD';

    return `You are an expert NPI (New Product Introduction) and manufacturing consultant with 20+ years of experience helping first-time founders bring products to market.

PLAYBOOK SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

PRODUCT SUMMARY:
- Name: ${product_name}
- Category: ${category}
- Sourcing Mode: ${sourcing_mode}
- Original Idea: ${wizard_input.originalIdea}
- Final Retail Price: ${finalRetail}
- Final Landed Cost: ${finalLanded}
- Target MOQ: ${finalMOQ}

Based on this frozen playbook snapshot, generate comprehensive manufacturing intelligence. Be specific, practical, and actionable. Avoid generic advice.

OUTPUT AS JSON matching this exact structure:

{
  "opportunity_score": <0-100>,
  "opportunity_rationale": "<2-3 sentences explaining the score>",
  "what_you_might_not_know": [
    "<Insight 1 about this product category>",
    "<Insight 2 - regulatory or technical consideration>",
    "<Insight 3 - market or competitive intelligence>",
    "<Insight 4 - manufacturing nuance>",
    "<Insight 5 - cost or timeline reality check>"
  ],
  
  "missing_info_scanner": [
    "<Critical data point 1 still needed>",
    "<Critical data point 2>",
    "<Critical data point 3>"
  ],
  
  "component_breakdown": [
    {
      "name": "<Component name>",
      "material_specification": "<Material/spec>",
      "supplier_type": "<Type of factory>",
      "complexity_level": "low|medium|high",
      "lead_time_estimate": "<Typical lead time>",
      "notes": "<Any special considerations>"
    }
  ],
  
  "bom_draft": [
    {
      "part_number": "<Optional>",
      "description": "<Item description>",
      "quantity": <number>,
      "unit_cost_estimate": "<Cost estimate>",
      "supplier_type": "<Factory type>",
      "notes": "<Notes>"
    }
  ],
  
  "certifications": [
    {
      "name": "<Certification name>",
      "required_for_markets": ["<Market 1>", "<Market 2>"],
      "approximate_cost": "<Cost range>",
      "timeline_to_obtain": "<Timeline>",
      "testing_requirements": ["<Test 1>", "<Test 2>"],
      "priority": "critical|recommended|optional"
    }
  ],
  
  "compliance_map": [
    {
      "regulation": "<Regulation name>",
      "market": "<Market>",
      "status": "required|recommended|not_applicable",
      "action_items": ["<Action 1>", "<Action 2>"]
    }
  ],
  
  "ip_strategy": {
    "patentability_signals": ["<Signal 1>", "<Signal 2>"],
    "copycat_risk": "low|medium|high",
    "copycat_risk_explanation": "<Explanation>",
    "protection_recommendations": ["<Rec 1>", "<Rec 2>"]
  },
  
  "supplier_analysis": {
    "types_required": ["<Factory type 1>", "<Factory type 2>"],
    "shortlist": [
      {
        "type": "<Factory type>",
        "recommended_regions": ["<Region 1>", "<Region 2>"],
        "approach": "<How to find and vet>",
        "typical_moq": "<MOQ range>",
        "what_to_ask": ["<Question 1>", "<Question 2>"]
      }
    ],
    "red_flags": ["<Red flag 1>", "<Red flag 2>"],
    "sourcing_tips": ["<Tip 1>", "<Tip 2>"]
  },
  
  "quality_assurance": {
    "qc_checklist": [
      {
        "inspection_point": "<What to inspect>",
        "what_to_check": "<Details>",
        "acceptance_criteria": "<Pass/fail criteria>",
        "when_to_check": "pre-production|during-production|final-inspection",
        "importance": "critical|major|minor"
      }
    ],
    "sample_to_production_risks": ["<Risk 1>", "<Risk 2>"],
    "inspection_strategy": "<Overall QC approach>"
  },
  
  "technical_decisions": [
    {
      "decision_point": "<Decision needed>",
      "options": ["<Option 1>", "<Option 2>"],
      "recommendation": "<Recommended choice>",
      "impact_if_wrong": "<Consequences>",
      "when_to_decide": "<Timeline>"
    }
  ],
  
  "risk_map": {
    "business_risks": [
      {
        "risk": "<Risk description>",
        "likelihood": "low|medium|high",
        "impact": "low|medium|high",
        "mitigation": "<How to mitigate>"
      }
    ],
    "manufacturing_risks": [
      {
        "risk": "<Risk description>",
        "likelihood": "low|medium|high",
        "impact": "low|medium|high",
        "mitigation": "<How to mitigate>"
      }
    ]
  },
  
  "founder_coaching": [
    {
      "topic": "<Topic area>",
      "guidance": "<Specific advice>",
      "common_mistakes": ["<Mistake 1>", "<Mistake 2>"],
      "best_practices": ["<Practice 1>", "<Practice 2>"]
    }
  ],
  
  "detailed_roadmap": [
    {
      "phase_number": 1,
      "name": "<Phase name>",
      "description": "<What happens>",
      "duration_estimate": "<Time estimate>",
      "key_activities": ["<Activity 1>", "<Activity 2>"],
      "dependencies": [<phase numbers this depends on>],
      "on_critical_path": true|false,
      "deliverables": ["<Deliverable 1>", "<Deliverable 2>"]
    }
  ],
  
  "break_even_analysis": {
    "break_even_units": <number>,
    "break_even_explanation": "<Explanation>",
    "profit_scenarios": [
      {
        "units_sold": <number>,
        "total_revenue": "<Amount>",
        "total_cost": "<Amount>",
        "net_profit": "<Amount>",
        "roi_percentage": "<Percentage>"
      }
    ]
  },
  
  "generated_at": "<ISO timestamp>",
  "model_version": "v1.0"
}

IMPORTANT GUIDELINES:

1. **Be Category-Specific**: 
   - Electronics → Focus on PCBA, certifications (FCC, CE, RoHS), EMI testing
   - Food/Beverage → Focus on FDA, shelf-life, food-safe materials, HACCP
   - Apparel → Focus on fabric sourcing, sizing, labor compliance, wash testing
   - Furniture → Focus on assembly, packaging, freight costs, safety standards

2. **Match Sourcing Mode**:
   - White Label → Finding catalogue products, branding, packaging, MOQs
   - Hybrid → Modifying designs, tooling changes, engineering revisions
   - Custom → Complete CAD, prototyping, tooling ownership, IP protection

3. **Use Real Numbers**: Based on the snapshot's pricing and MOQ, calculate actual break-even and profit scenarios

4. **Identify Gaps**: What critical information is missing for a realistic manufacturing plan?

5. **Actionable Roadmap**: Create 8-12 phases that are specific to this product, not generic steps

6. **Risk Reality**: Don't sugarcoat - identify real risks and practical mitigations

7. **Coaching Value**: Give advice you'd give a founder over coffee, not textbook theory

Generate the complete JSON response now:`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { snapshot } = body as { snapshot: PlaybookSnapshot };

        if (!snapshot) {
            return NextResponse.json(
                { error: 'Snapshot is required' },
                { status: 400 }
            );
        }

        console.log('Generating deep analysis for:', snapshot.product_name);

        // Generate comprehensive AI analysis
        const prompt = buildDeepAnalysisPrompt(snapshot);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert manufacturing and NPI consultant. Always respond with valid JSON matching the requested structure exactly.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        });

        const rawResponse = completion.choices[0]?.message?.content;
        if (!rawResponse) {
            throw new Error('No response from OpenAI');
        }

        // Parse and validate
        const aiAnalysis: ProjectAIAnalysis = JSON.parse(rawResponse);

        return NextResponse.json({
            ai_analysis: aiAnalysis
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error in analyze:', error);
        return NextResponse.json(
            { error: 'Failed to generate analysis', details: error.message },
            { status: 500 }
        );
    }
}
