const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const envPath = path.join(process.cwd(), '.env.local');
let apiKey = process.env.GOOGLE_API_KEY;

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
}

const cmd = `curl -H 'Content-Type: application/json' \
-d '{"contents":[{"parts":[{"text":"Explain how AI works"}]}]}' \
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}"`;

console.log('Running curl...');
exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
