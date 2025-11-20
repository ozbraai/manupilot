import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title && !description) {
      return NextResponse.json({ category: 'General' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json({ category: 'General' });
    }

    const prompt = `
You are a product categorisation assistant.

Given this product idea:

Title: "${title || ''}"
Description: "${description || ''}"

Choose ONE best-fitting high-level category from this list:

- Outdoor & Camping
- Kitchen & Cooking
- Electronics & Gadgets
- Home & Garden
- Children & Baby
- Office & Productivity
- Tools & Hardware
- Apparel & Accessories
- Other

Respond ONLY with a short JSON object in this exact format:

{"category": "Outdoor & Camping"}
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You output only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.2,
      }),
    });

    const data = await res.json();

    let category = 'General';
    try {
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      if (parsed?.category && typeof parsed.category === 'string') {
        category = parsed.category;
      }
    } catch (e) {
      console.error('Error parsing category JSON:', e);
    }

    return NextResponse.json({ category });
  } catch (e) {
    console.error('Error in /api/project-category:', e);
    return NextResponse.json({ category: 'General' });
  }
}