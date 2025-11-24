-- Create content table for CMS
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Content classification
    type TEXT NOT NULL CHECK (type IN ('educational', 'template', 'label')),
    category TEXT NOT NULL, -- e.g., 'blog', 'guide', 'rfq_template', 'product_category'
    
    -- Content data
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    body TEXT, -- Markdown for educational, JSON for templates/labels
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Status management
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Authorship
    author_id UUID REFERENCES auth.users(id),
    
    -- Indexes for performance
    CONSTRAINT content_slug_key UNIQUE (slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_is_deleted ON content(is_deleted);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_updated_at
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_content_updated_at();

-- Add comments
COMMENT ON TABLE content IS 'CMS content for educational materials, templates, and system labels';
COMMENT ON COLUMN content.type IS 'High-level content type: educational, template, or label';
COMMENT ON COLUMN content.category IS 'Specific category within type (e.g., blog, rfq_template)';
COMMENT ON COLUMN content.body IS 'Content body - Markdown for educational, JSON for templates/labels';
COMMENT ON COLUMN content.metadata IS 'Flexible metadata storage';
COMMENT ON COLUMN content.is_deleted IS 'Soft delete flag';
