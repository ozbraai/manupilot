-- Create platform_settings table for global platform configuration
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Branding
    system_name TEXT NOT NULL DEFAULT 'Manupilot',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6', -- Blue-500
    accent_color TEXT DEFAULT '#10B981', -- Green-500
    
    -- Contact
    support_email TEXT NOT NULL DEFAULT 'support@manupilot.com',
    
    -- Pricing (stored as JSON array)
    pricing_tiers JSONB DEFAULT '[]'::jsonb,
    
    -- API Keys (encrypted/masked in UI)
    api_keys JSONB DEFAULT '{}'::jsonb,
    
    -- Feature flags for future use
    feature_flags JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT platform_settings_support_email_check CHECK (support_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT platform_settings_primary_color_check CHECK (primary_color ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT platform_settings_accent_color_check CHECK (accent_color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Ensure only one row exists (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS platform_settings_singleton ON platform_settings ((true));

-- Updated trigger
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_settings_updated_at
BEFORE UPDATE ON platform_settings
FOR EACH ROW
EXECUTE FUNCTION update_platform_settings_updated_at();

-- Insert default settings (only if table is empty)
INSERT INTO platform_settings (
    system_name,
    logo_url,
    primary_color,
    accent_color,
    support_email,
    pricing_tiers,
    api_keys
)
SELECT
    'Manupilot',
    NULL,
    '#3B82F6',
    '#10B981',
    'support@manupilot.com',
    '[
        {
            "name": "Free",
            "price": 0,
            "features": ["Basic playbook generation", "Up to 3 projects", "Community support"]
        },
        {
            "name": "Pro",
            "price": 49,
            "features": ["Unlimited projects", "Advanced AI features", "Priority support", "RFQ automation"]
        },
        {
            "name": "Enterprise",
            "price": 199,
            "features": ["Everything in Pro", "Custom integrations", "Dedicated account manager", "SLA guarantee"]
        }
    ]'::jsonb,
    '{
        "openai_key": "sk-...",
        "stripe_key": "sk_test_...",
        "supabase_service_key": "..."
    }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);

-- Comments
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings (singleton table)';
COMMENT ON COLUMN platform_settings.pricing_tiers IS 'Array of pricing tier objects with name, price, and features';
COMMENT ON COLUMN platform_settings.api_keys IS 'Encrypted API keys for third-party services';
COMMENT ON COLUMN platform_settings.feature_flags IS 'Feature flags for A/B testing and gradual rollouts';
