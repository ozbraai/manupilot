import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
      return NextResponse.json(
        { productName: '' },
        { status: 200 }
      );
    }

    const prompt = `
You will receive a description of a physical product idea.

Your job:
1. Read the description.
2. Extract a short, clear product name (2–5 words) that captures what is being built.
3. The name should be generic but specific enough to be useful in follow-up questions.
4. Do NOT include extra sentences or commentary.
5. Respond ONLY with valid JSON in this exact shape:

{"productName": "short product name here"}

Here is the product description:

"""${idea}"""
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a precise JSON-generating assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 80,
      }),
    });

    const data = await res.json();

    let productName = '';

    try {
      const content = data.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.productName === 'string') {
        productName = parsed.productName.trim();
      }
    } catch (e) {
      console.warn('Failed to parse productName JSON, will fall back to simple extraction.');
    }

    // Fallback: if parsing failed or result is empty, just return empty string
    return NextResponse.json({ productName });
  } catch (error) {
    console.error('Error in wizard plan route:', error);
    return NextResponse.json(
      { productName: '' },
      { status: 200 }
    );
  }
}