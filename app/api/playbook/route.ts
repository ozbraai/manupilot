import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { idea, productName, questions, answers } = await req.json();

    const qaText = questions
      .map(
        (q: any, idx: number) =>
          `Q${idx + 1}: ${q.title}\nA${idx + 1}: ${answers[q.key] || ''}`
      )
      .join('\n\n');

const prompt = `
You are ManuBot, an expert product development & manufacturing strategist.

You will receive:
- A raw product idea
- A short product name
- The founder's answers to 5 tailored questions

Your job is to generate a FREE manufacturing playbook.

IMPORTANT:
- Tailor all content to the specific product type.
- Output ONLY valid JSON.

JSON structure:

{
  "productName": "string",
  "free": {
    "summary": "string",
    "targetCustomer": "string",
    "keyFeatures": ["..."],
    "materials": ["..."],
    "manufacturingApproach": {
      "recommendedRegions": ["..."],
      "rationale": "string",
      "risks": ["..."]
    },
    "pricing": {
      "positioning": "string",
      "insight": "string"
    },
    "timeline": ["..."],
    "nextSteps": ["..."],
    "roadmapPhases": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "tasks": ["task 1", "task 2", "task 3"]
      }
    ]
  }
}

DO NOT include any other fields.

Product idea:
"${idea}"

Short product name:
"${productName}"

Founder Q&A:
${qaText}

Respond with ONLY the JSON object above.
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You output ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });

    const raw = await openaiRes.text();
    console.log('OpenAI raw response for /api/playbook:', raw);

    let playbook: any = null;

    try {
      const openaiJson = JSON.parse(raw);
      const content = openaiJson.choices?.[0]?.message?.content || '{}';
      playbook = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI JSON:', e);
      return NextResponse.json(
        { error: 'AI response was not valid JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error('Playbook route error:', error);
    return NextResponse.json(
      { error: 'Failed to create playbook' },
      { status: 500 }
    );
  }
}