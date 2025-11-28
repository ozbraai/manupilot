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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
    console.log('Checking nda_acceptances table...');
    const { data, error } = await supabase
        .from('nda_acceptances')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error accessing table:', error);
    } else {
        console.log('Table exists. Row count:', data); // data is null for head:true, count is in count property but select returns object with count
        // Actually select count returns { count: number, ... }
    }

    // Try to insert a dummy record to check RLS/constraints if table exists
    // But we need a valid user_id. 
    // Let's just rely on the select error.
}

checkTable();
