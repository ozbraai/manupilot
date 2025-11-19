import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idea, productName } = await req.json();

    if (!idea || idea.length < 5) {
      return NextResponse.json({ questions: [] });
    }

    const prompt = `
You are ManuPilot, an AI product manufacturing assistant. 
Your task: read the product idea and generate EXACTLY 5 product-specific questions.

Rules:
- Each question must be relevant to the specific product category.
- Include manufacturing considerations (materials, durability, quality, form factor, region).
- Include market considerations (competition, usage, customer expectations).
- Respond ONLY in valid JSON.

Format:
{
  "questions": [
    {
      "key": "q1",
      "label": "short label",
      "title": "full question",
      "helper": "short explanation",
      "placeholder": "example input"
    },
    ...
  ]
}

Product idea:
"${idea}"

Short product name:
"${productName}"
`;

    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a JSON generator." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI question generator failed:", err);
    return NextResponse.json({ questions: [] });
  }
}