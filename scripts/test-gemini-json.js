const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const fs = require('fs');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = process.env.GOOGLE_API_KEY;

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
}

async function testJsonMode() {
    console.log('Testing Gemini Flash with JSON mode...');
    try {
        const genAI = new GoogleGenAI({
            apiKey: apiKey,
            apiVersion: 'v1'
        });

        const prompt = `
        Extract components for a bicycle.
        Return JSON: { "components": [], "visualElements": [] }
        `;

        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash-001',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                response_mime_type: 'application/json'
            }
        });

        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));

        const text = response.text();
        console.log('Response text:', text);

        JSON.parse(text);
        console.log('JSON parse successful');

    } catch (error) {
        console.error('JSON Mode Test Failed:', error);
    }
}

testJsonMode();
