import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface QuoteAnalysis {
    metrics: {
        unit_price?: number;
        moq?: number;
        lead_time_days?: number;
        payment_terms?: string;
        currency?: string;
    };
    score: number;
    flags: string[];
    summary: string;
}

export async function analyzeQuote(
    rawText: string,
    context: { targetPrice?: number; targetMoq?: number }
): Promise<QuoteAnalysis> {
    const prompt = `
    You are a procurement expert. Analyze the following manufacturer quote response and extract key metrics.
    
    Context:
    - Target Price: ${context.targetPrice || 'N/A'}
    - Target MOQ: ${context.targetMoq || 'N/A'}

    Quote Text:
    """
    ${rawText}
    """

    Tasks:
    1. Extract structured metrics: Unit Price, MOQ, Lead Time (in days), Payment Terms, Currency.
    2. Score the quote from 0-100 based on how well it meets the targets (if provided) and general professionalism.
    3. Flag any potential issues (e.g., "Price significantly higher than target", "Unusually long lead time", "Vague payment terms").
    4. Provide a brief 1-sentence summary.

    Output JSON format:
    {
      "metrics": {
        "unit_price": number | null,
        "moq": number | null,
        "lead_time_days": number | null,
        "payment_terms": string | null,
        "currency": string
      },
      "score": number,
      "flags": string[],
      "summary": string
    }
  `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        return JSON.parse(content) as QuoteAnalysis;
    } catch (error) {
        console.error('Error analyzing quote:', error);
        // Return a safe fallback
        return {
            metrics: {},
            score: 0,
            flags: ['AI Analysis Failed'],
            summary: 'Could not analyze quote due to an error.',
        };
    }
}
