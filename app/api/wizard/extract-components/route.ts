import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
  apiVersion: 'v1beta'
});

export async function POST(req: Request) {
  try {
    const { idea, productName, category } = await req.json();

    const prompt = `
You are a product design expert. Analyze the product idea and extract ALL distinct components.

Product: ${productName}
Category: ${category}
Description: ${idea}

Return a JSON object with this structure:
{
  "components": [
    {
      "id": "comp-1",
      "name": "Lid",
      "category": "structure",
      "defaultMaterial": "Stainless Steel",
      "materialOptions": ["Stainless Steel", "Aluminum", "Plastic", "Glass"],
      "defaultFeatures": ["Vented", "Insulated"],
      "featureOptions": {
        "ventilation": ["None", "Vented", "Sealed"],
        "insulation": ["None", "Insulated", "Double-Walled"]
      }
    },
    {
      "id": "comp-2",
      "name": "Body",
      "category": "structure",
      "defaultMaterial": "Stainless Steel",
      "materialOptions": ["Stainless Steel", "Aluminum", "Cast Iron"],
      "defaultFeatures": ["Non-Stick Coating"],
      "featureOptions": {
        "coating": ["None", "Non-Stick", "Ceramic", "Enamel"]
      }
    }
  ],
  "visualElements": [
    {
      "id": "visual-1",
      "name": "Logo Placement",
      "type": "branding",
      "options": ["None", "Engraved", "Printed", "Embossed"],
      "default": "None"
    },
    {
      "id": "visual-2",
      "name": "Color Scheme",
      "type": "aesthetic",
      "options": ["Silver", "Black", "White", "Custom"],
      "default": "Silver"
    }
  ]
}

Rules:
- Extract 3-8 main components
- For each component, provide 3-6 realistic material options
- Include features specific to that component type
- Add 1-3 visual/branding elements (logo, color, finish)
- Use proper manufacturing terminology
- Return ONLY valid JSON.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    // @ts-ignore
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini response text:', text); // Log for debugging

    const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanContent);

    const componentsData = {
      components: parsedData.components || [],
      visualElements: parsedData.visualElements || []
    };

    return NextResponse.json(componentsData);
  } catch (error: any) {
    console.error('Component extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract components' },
      { status: 500 }
    );
  }
}
