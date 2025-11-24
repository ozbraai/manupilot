import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
      return NextResponse.json(
        { productName: '', category: 'General' },
        { status: 200 }
      );
    }

    const prompt = `
You are an expert manufacturing consultant.
Analyze the user's product idea and extract:
1. A short, clear "productName" (2-5 words).
2. A specific "category" (e.g., "Kitchenware", "Consumer Electronics", "Apparel", "Industrial Equipment").

Product Idea: "${idea}"

Respond in JSON format:
{
  "productName": "...",
  "category": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content || '{}';
    let result = { productName: '', category: 'General' };

    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON from AI:', e);
    }

    return NextResponse.json({
      productName: result.productName || 'New Product',
      category: result.category || 'General',
    });

  } catch (error) {
    console.error('Error in wizard plan route:', error);
    return NextResponse.json(
      { productName: '', category: 'General' },
      { status: 200 }
    );
  }
}