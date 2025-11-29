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

const genAI = new GoogleGenAI({
    apiKey: apiKey,
    apiVersion: 'v1beta'
});

async function debugExtract() {
    console.log('Debugging component extraction...');
    console.log('API Key loaded:', apiKey ? apiKey.substring(0, 5) + '...' : 'NO');

    try {
        const models = await genAI.models.list();
        if (models.models) {
            console.log('Available models:', JSON.stringify(models.models.map(m => m.name)));
        } else {
            console.log('No models found in response keys:', Object.keys(models));
        }
    } catch (e) {
        console.error('List models failed:', e);
    }

    const idea = "A compact charcoal BBQ designed for caravaners with foldable legs and a removable ash catcher.";
    const productName = "Caravan BBQ";
    const category = "Outdoor Cooking";

    const prompt = `You are an expert in product design and manufacturing. Your task is to break down a product idea into its core components and suggest potential materials for each.

Product Idea: ${idea}
Product Name: ${productName}
Category: ${category}

Please provide the output as a JSON array of objects, where each object represents a component. Each component object should have the following properties:
- "name": (string) The name of the component.
- "description": (string) A brief description of the component's function or form.
- "materials": (array of strings) A list of 1-3 suitable materials for this component.
- "sub_components": (array of objects, optional) If a component can be further broken down, list its sub-components using the same structure.

Example:
[
  {
    "name": "Main Body",
    "description": "The primary structure of the BBQ.",
    "materials": ["Stainless Steel", "Powder-coated Steel"]
  },
  {
    "name": "Grill Grate",
    "description": "The surface where food is cooked.",
    "materials": ["Cast Iron", "Stainless Steel"]
  }
]

Now, break down the "${productName}" into its components:`;

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        console.log('Response keys:', Object.keys(response));
        // console.log('Response:', JSON.stringify(response, null, 2));

        // Try accessing candidates directly if text() doesn't exist
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Gemini response text:', text);

        const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanContent);
        console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));

    } catch (error) {
        console.error('Extraction Error:', error);
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

debugExtract();
