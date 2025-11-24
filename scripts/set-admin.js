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
        console.error('\nTo fix this, run:');
        console.error('export SUPABASE_SERVICE_ROLE_KEY=eyJh... (your actual service_role key from Supabase Dashboard > Project Settings > API)');
        console.error('node scripts/set-admin.js');
    }
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin() {
    const email = 'clinton@ozbraai.com.au';

    // 1. Find user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('List users error:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found:', email);
        return;
    }

    console.log('Found user:', user.id);

    // 2. Update metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { app_metadata: { role: 'admin' } }
    );

    if (error) {
        console.error('Update error:', error);
    } else {
        console.log('Successfully set admin role for:', email);
        console.log('New app_metadata:', data.user.app_metadata);
    }
}

setAdmin();
