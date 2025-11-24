import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

function maskApiKeys(apiKeys: any): any {
    if (!apiKeys || typeof apiKeys !== 'object') return {};

    const masked: any = {};
    for (const [key, value] of Object.entries(apiKeys)) {
        if (typeof value === 'string' && value.length > 4) {
            masked[key] = '***' + value.slice(-4);
        } else {
            masked[key] = value;
        }
    }
    return masked;
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = getAdminClient();
        const { data: settings, error } = await supabaseAdmin
            .from('platform_settings')
            .select('*')
            .single();

        if (error) throw error;

        // Mask API keys before returning
        const maskedSettings = {
            ...settings,
            api_keys: maskApiKeys(settings.api_keys)
        };

        return NextResponse.json({ settings: maskedSettings });

    } catch (error: any) {
        console.error('Admin settings API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.app_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { system_name, logo_url, primary_color, accent_color, support_email, pricing_tiers, api_keys } = body;

        // Validation
        if (support_email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(support_email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (primary_color && !/^#[0-9A-Fa-f]{6}$/.test(primary_color)) {
            return NextResponse.json({ error: 'Invalid primary color format (use hex: #RRGGBB)' }, { status: 400 });
        }

        if (accent_color && !/^#[0-9A-Fa-f]{6}$/.test(accent_color)) {
            return NextResponse.json({ error: 'Invalid accent color format (use hex: #RRGGBB)' }, { status: 400 });
        }

        const supabaseAdmin = getAdminClient();

        // Get current settings to merge API keys (don't overwrite masked keys)
        const { data: currentSettings } = await supabaseAdmin
            .from('platform_settings')
            .select('id, api_keys')
            .single();

        let updatedApiKeys = currentSettings?.api_keys || {};
        if (api_keys) {
            // Only update keys that aren't masked
            for (const [key, value] of Object.entries(api_keys)) {
                if (typeof value === 'string' && !value.startsWith('***')) {
                    updatedApiKeys[key] = value;
                }
            }
        }

        // Build update object (only include provided fields)
        const updateData: any = {};
        if (system_name !== undefined) updateData.system_name = system_name;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (primary_color !== undefined) updateData.primary_color = primary_color;
        if (accent_color !== undefined) updateData.accent_color = accent_color;
        if (support_email !== undefined) updateData.support_email = support_email;
        if (pricing_tiers !== undefined) updateData.pricing_tiers = pricing_tiers;
        if (Object.keys(updatedApiKeys).length > 0) updateData.api_keys = updatedApiKeys;

        const { data: settings, error } = await supabaseAdmin
            .from('platform_settings')
            .update(updateData)
            .eq('id', currentSettings?.id || '')
            .select()
            .single();

        if (error) throw error;

        // Mask API keys before returning
        const maskedSettings = {
            ...settings,
            api_keys: maskApiKeys(settings.api_keys)
        };

        return NextResponse.json({ settings: maskedSettings });

    } catch (error: any) {
        console.error('Admin settings save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
