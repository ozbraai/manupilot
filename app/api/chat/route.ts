import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    // Debug logs – will appear in your terminal when running `npm run dev`
    console.log('Chat route called. Message:', message);
    console.log('Has OPENAI_API_KEY?', !!apiKey);

    if (!apiKey) {
      console.error('OPENAI_API_KEY is missing or not loaded');
      return NextResponse.json(
        { reply: 'The AI service is not configured yet.' },
        { status: 500 }
      );
    }

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // this model name is fine; we can change later if needed
        messages: [
          {
            role: 'system',
            content:
              'You are ManuBot, the friendly assistant for ManuPilot. Answer questions about product creation, sourcing, manufacturing, shipping, and how ManuPilot works. Be concise and helpful.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('OpenAI API error:', apiRes.status, errorText);
      return NextResponse.json(
        { reply: 'I had trouble talking to the AI service.' },
        { status: 500 }
      );
    }

    const data = await apiRes.json();

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ??
      'I am not sure how to answer that, but I can help you think through your product idea.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route unexpected error:', err);
    return NextResponse.json(
      { reply: 'Unexpected server error, please try again.' },
      { status: 500 }
    );
  }
}