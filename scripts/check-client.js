const { GoogleGenAI } = require('@google/genai');
console.log('GoogleGenAI type:', typeof GoogleGenAI);
console.log('GoogleGenAI prototype:', Object.getOwnPropertyNames(GoogleGenAI.prototype));
try {
    const client = new GoogleGenAI({ apiKey: 'test' });
    console.log('Client keys:', Object.keys(client));
    console.log('Client.models:', client.models);
} catch (e) {
    console.log('Error instantiating:', e.message);
}
