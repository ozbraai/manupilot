const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load from .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (e) {
    console.log('Could not read .env.local');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL (checked .env.local) and SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
        console.error('Please export SUPABASE_SERVICE_ROLE_KEY=your_key before running.');
    }
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
    console.log('--- PROJECTS ---');
    const { data: projects, error: pError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (pError) console.error('Projects Error:', pError);
    else console.log('Columns:', projects && projects.length > 0 ? Object.keys(projects[0]) : 'No projects found');

    console.log('\n--- RFQ SUBMISSIONS ---');
    const { data: rfqs, error: rError } = await supabase
        .from('rfq_submissions')
        .select('*')
        .limit(1);

    if (rError) console.error('RFQs Error:', rError);
    else {
        console.log('Columns:', rfqs && rfqs.length > 0 ? Object.keys(rfqs[0]) : 'No rfqs found');
        if (rfqs && rfqs.length > 0) {
            console.log('Sample Data:', JSON.stringify(rfqs[0], null, 2));
        }
    }
}

inspectSchema();
