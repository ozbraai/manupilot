const { GoogleGenerativeAI } = require('@google/generative-ai');
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

async function testOldSdk() {
    console.log('Testing @google/generative-ai listing models...');
    try {
        // Note: Old SDK doesn't have a direct listModels method on the client instance usually, 
        // it's often a separate import or method. 
        // Actually, GoogleGenerativeAI class doesn't have listModels.
        // We need to use the API directly or just try gemini-pro.

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("List 3 components of a bicycle.");
        const response = await result.response;
        console.log('Success with gemini-pro! Response:', response.text().slice(0, 100) + '...');
    } catch (error) {
        console.error('Old SDK Test Failed:', error);
    }
}

testOldSdk();
