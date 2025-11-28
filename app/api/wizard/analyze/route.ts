
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FeasibilityFeatures } from '@/lib/feasibility';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { idea, referenceLink, image, designStage } = body;

        if (!idea) {
            return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
        }

        const systemPrompt = `
You are ManuBot, an expert product manufacturing consultant.
Analyze the user's product idea and provide a structured analysis.

User Input:
Idea: "${idea}"
Reference Link: "${referenceLink || 'None'}"
Design Stage: "${designStage || 'Idea only'}"
Image Metadata: "${image ? 'Image provided' : 'No image'}"

Return a JSON object with the following fields:
- productName: A short, catchy name for the product.
- category: The product category (e.g., "Outdoor Cooking", "Consumer Electronics").
- coreProductSummary: A one-sentence summary of what the product is.
- keyCharacteristics: An array of 3-6 short strings describing key features or attributes.
- similarProducts: An array of up to 3 similar existing products. Each object should have:
    - id: A unique string ID (e.g., "sim-1").
    - title: Product name.
    - reason: Why it is similar.
    - imageUrl: (Optional) A placeholder URL if you know a generic one, otherwise null.
- feasibilityInputs: An object matching the 'FeasibilityFeatures' type structure. Estimate these values based on the idea.
    - productCategory: string
    - processes: string[] (e.g., "injection_moulding", "cnc")
    - partsCount: number
    - hasElectronics: boolean
    - requiresCustomTooling: boolean
    - toolingCostBand: "None" | "Low" | "Medium" | "High"
    - unitCostBand: "Low" | "Medium" | "High"
    - moqBand: "Low" | "Medium" | "High"
    - weightClass: "Light" | "Medium" | "Heavy"
    - fragility: "Low" | "Medium" | "High"
    - complianceLevel: "Basic" | "Moderate" | "Strict"
    - typicalRegions: { region: string, suitability: number, notes: string }[]
    - competitionCategory: "Commodity" | "Brandable" | "Niche"
    - amazonSaturation: "Low" | "Medium" | "High"
    - differentiationDifficulty: "Low" | "Medium" | "High"
    - differentiationDifficulty: "Low" | "Medium" | "High"
    - trendDirection: "Declining" | "Flat" | "Growing" | "Exploding"
    - marketMaturity: "New" | "Emerging" | "Established" | "Saturated"
    - sourcingMode: "white-label" | "combination" | "custom" | "auto"
- aiSuggestedSourcingMode: "white-label" | "combination" | "custom"
    - "white-label": If it's a generic item easily found on Alibaba.
    - "combination": If it's a standard item with minor tweaks.
    - "custom": If it requires new moulds, unique mechanism, or is a novel invention.
- suggestedUniquenessFactor: "branding_only" | "light_improvements" | "moderate_innovation" | "highly_unique" | "category_creating"
    - "branding_only": Logo on existing product.
    - "light_improvements": Minor tweaks (color, material).
    - "moderate_innovation": New features on standard base.
    - "highly_unique": Significant new design.
    - "category_creating": Never seen before.

Ensure all fields are populated realistically based on the input.
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt }
            ]
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const analysis = JSON.parse(content);

        // Calculate feasibility snapshot immediately for the UI to show
        // We can import calculateFeasibility if we want to return the score structure too,
        // but the UI might just need the inputs or we can do it here.
        // The plan says "The analysis endpoint should return at least... feasibilityInputs".
        // Let's also return the computed snapshot for immediate display if needed.

        // For now, just return the analysis as is. The UI will pass feasibilityInputs to /api/playbook later.
        // Actually, Step 2 UI shows "Feasibility Snapshot" in the mockup description?
        // "Popup A... Estimating typical costs... Step 2... Show coreProductSummary... Step 3... Popup B... /api/playbook"
        // Wait, the user request says: "Step 2... Show coreProductSummary... Step 3... On clicking Next: Show Popup B... Call /api/playbook... Inside /api/playbook... Use lib/feasibility.ts to compute a feasibility snapshot."
        // So /api/wizard/analyze doesn't strictly NEED to return the full snapshot, but it returns the INPUTS.
        // However, the UI for Step 2 might want to show some "Feasibility Snapshot" data?
        // The user request says: "Step 2 - Confirm Understanding... Section 1 - Product understanding... Section 2 - Similar products... No popup on this step."
        // It doesn't explicitly say Step 2 shows the feasibility score.
        // BUT, the existing code I read in page.tsx showed a Feasibility Snapshot in Step 3 (Confirmation).
        // The NEW Step 2 is "Confirm Understanding".
        // The NEW Step 3 is "Choose Manufacturing Approach".
        // The user request says: "Step 3... On clicking Next: Show Popup B... Call /api/playbook... Attach the feasibility output as playbook.feasibilitySnapshot".
        // So the full snapshot is generated at the END.
        // However, the analysis endpoint returns "feasibilityInputs".
        // I will return the inputs.

        return NextResponse.json(analysis);

    } catch (error) {
        console.error('Analysis Error:', error);
        return NextResponse.json({ error: 'Failed to analyze idea' }, { status: 500 });
    }
}
