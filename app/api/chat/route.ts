import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are ManuBot, the friendly assistant for ManuPilot. Answer questions about product creation, sourcing, manufacturing and the ManuPilot platform.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await apiRes.json();
    const reply =
      data.choices?.[0]?.message?.content || "Sorry, I had trouble answering.";

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { reply: "Server error, please try again." },
      { status: 500 }
    );
  }
}