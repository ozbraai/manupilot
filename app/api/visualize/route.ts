import { GoogleGenAI } from '@google/genai'; // Ensure you have the 2025 SDK version
import { NextResponse } from 'next/server';

// Initialize the client
const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        // Call the "Nano Banana Pro" model
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            config: {
                responseModalities: ['IMAGE'], // Explicitly ask for an image
                // @ts-ignore
                generationConfig: {
                    aspectRatio: "1:1", // Perfect for product thumbnails
                    sampleCount: 1,
                    personGeneration: "dont_allow" // Keeps it focused on the product
                }
            }
        });

        // Extract the image data (usually Base64 in this SDK version)
        const image = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (!image) {
            throw new Error("No image generated");
        }

        return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${image.data}`
        });

    } catch (error: any) {
        console.error("Nano Banana API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to visualize product" },
            { status: 500 }
        );
    }
}
