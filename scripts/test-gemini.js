const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = process.env.GOOGLE_API_KEY;

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
        console.log('Found API Key in .env.local');
    }
}

if (!apiKey) {
    console.error('Error: GOOGLE_API_KEY not found in environment or .env.local');
    process.exit(1);
}

async function testFlash() {
    console.log('\n--- Testing Gemini 1.5 Flash (Component Extraction) ---');
    try {
        const client = new GoogleGenAI({ apiKey: apiKey });
        const models = await client.models.list();
        console.log('Models response keys:', Object.keys(models));
        // console.log('Models response:', JSON.stringify(models, null, 2)); // Too verbose?

        // Try v1
        console.log('Trying v1...');
        const clientV1 = new GoogleGenAI({ apiKey: apiKey, apiVersion: 'v1' });
        const response = await clientV1.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: "List 3 components of a bicycle." }] }]
        });
        console.log('Success with v1! Response:', response.text().slice(0, 100) + '...');

    } catch (error) {
        console.error('Flash Test Failed:', error.message);
    }
}

async function testProImage() {
    console.log('\n--- Testing Gemini 3 Pro Image (Visualization) ---');
    try {
        const client = new GoogleGenAI({ apiKey: apiKey });
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [{ role: 'user', parts: [{ text: "A bicycle" }] }],
            config: {
                responseModalities: ['IMAGE'],
                generationConfig: { sampleCount: 1 }
            }
        });

        const image = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (image) {
            console.log('Success! Image generated (Base64 length):', image.data.length);
        } else {
            console.error('Pro Image Test Failed: No image returned');
        }
    } catch (error) {
        console.error('Pro Image Test Failed:', error.message);
    }
}

async function run() {
    await testFlash();
    await testProImage();
}

run();
