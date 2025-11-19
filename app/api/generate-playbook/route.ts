import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = `
You are ManuBot, the AI manufacturing co-pilot for ManuPilot.

The user has answered these questions about a product they want to build:

Product idea: ${answers.productIdea}
Target user: ${answers.targetUser}
Target price: ${answers.targetPrice}
Dimensions: ${answers.dimensions}
Materials: ${answers.materials}
Cost vs quality priority: ${answers.costVsQuality}
Preferred regions: ${answers.regions}
Timeline: ${answers.timeline}
Market saturation view: ${answers.saturation}
Additional notes: ${answers.notes}

Using this information, create a concise but professional "Manufacturing Playbook" as a JSON object in this exact structure:

{
  "title": string,
  "summary": string,
  "productOverview": {
    "description": string,
    "targetUser": string,
    "useCases": string[]
  },
  "materials": [
    {
      "name": string,
      "role": string,
      "pros": string[],
      "cons": string[]
    }
  ],
  "regionRecommendations": [
    {
      "region": string,
      "suitability": "high" | "medium" | "low",
      "reasoning": string,
      "notes": string
    }
  ],
  "costInsights": {
    "feasibility": string,
    "mainCostDrivers": string[],
    "tradeoffs": string[]
  },
  "timeline": [
    {
      "phase": string,
      "durationEstimate": string,
      "notes": string
    }
  ],
  "marketSaturation": {
    "riskLevel": "low" | "medium" | "high",
    "summary": string,
    "differentiationIdeas": string[]
  },
  "nextSteps": string[],
  "risks": string[]
}

Keep answers practical and founder-friendly. Do not add extra fields. Do not output markdown or prose outside JSON. Respond with ONLY the JSON.
`;

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a precise JSON API that responds only with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 900,
      }),
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error("OpenAI error:", apiRes.status, text);
      return NextResponse.json(
        { error: "Failed to generate playbook" },
        { status: 500 }
      );
    }

    const data = await apiRes.json();
    const content = data.choices?.[0]?.message?.content;
    const playbook = JSON.parse(content);

    return NextResponse.json({ playbook });
  } catch (err: any) {
    console.error("Playbook route error:", err);
    return NextResponse.json(
      { error: "Unexpected error generating playbook" },
      { status: 500 }
    );
  }
}