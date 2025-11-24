-- Create AI prompts table for centralized prompt management
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Classification
    category TEXT NOT NULL CHECK (category IN ('wizard', 'playbook', 'components', 'cost_estimation', 'compliance', 'matching', 'qc')),
    name TEXT NOT NULL UNIQUE, -- e.g., 'playbook_generation_v1'
    
    -- Prompt content
    template TEXT NOT NULL,
    description TEXT,
    
    -- Management
    version INTEGER DEFAULT 1,
    is_frozen BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage tracking
    token_usage JSONB DEFAULT '{}'::jsonb,
    
    -- Audit
    last_edited_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT ai_prompts_name_key UNIQUE (name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_active ON ai_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_name ON ai_prompts(name);

-- Updated trigger
CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_prompts_updated_at
BEFORE UPDATE ON ai_prompts
FOR EACH ROW
EXECUTE FUNCTION update_ai_prompts_updated_at();

-- Seed with existing prompts
INSERT INTO ai_prompts (category, name, template, description, version) VALUES
(
    'playbook',
    'playbook_generation_v1',
    'You are a Senior NPI (New Product Introduction) Program Manager.
Your goal is to produce a BRUTALLY REALISTIC manufacturing plan.

Context:
Product: "{productName}"
Category: "{category}"
Market: "{market}"
Mode: {mode}
Target Cost: {targetPrice}

Generate a JSON PlaybookV2 object.

RULES:
- "summary": Professional executive summary (2-3 sentences).
- "targetCustomer": Specific persona.
- "keyFeatures": 3-5 distinct selling points.
- "materials": Specific materials (e.g. "304 Stainless Steel", "ABS Plastic").
- "manufacturingApproach":
  - "approach": Array of 3-5 specific manufacturing strategy steps/recommendations.
  - "recommendedRegions": e.g. ["Shenzhen, China", "Vietnam"]
  - "rationale": Why these regions?
  - "risks": Specific manufacturing risks.
- "pricing":
  - "positioning": e.g. "Premium", "Mid-range", "Budget"
  - "insight": Why this pricing strategy works.
- "timeline": 4-6 high-level phases (e.g. "Phase 1: Prototyping (2 months)").
- "nextSteps": 3 immediate actions for the founder.

Output STRICT JSON:
{
  "free": {
    "summary": "...",
    "targetCustomer": "...",
    "keyFeatures": ["..."],
    "materials": ["..."],
    "manufacturingApproach": {
      "approach": ["...", "...", "..."],
      "recommendedRegions": ["..."],
      "rationale": "...",
      "risks": ["..."]
    },
    "pricing": {
      "positioning": "...",
      "insight": "..."
    },
    "timeline": ["..."],
    "nextSteps": ["..."]
  }
}',
    'Generates manufacturing playbook with realistic recommendations',
    1
),
(
    'wizard',
    'wizard_questions_white_label_v1',
    'You are a sourcing expert helping someone find white-label manufacturers.
Product: {productName}
Category: {category}

Generate 3-5 critical questions to ask potential suppliers.
Focus on: Customization limits, MOQs, lead times, certifications.

Output JSON array of strings:
["Question 1", "Question 2", ...]',
    'Generates supplier questions for white-label sourcing',
    1
),
(
    'wizard',
    'wizard_questions_custom_v1',
    'You are a manufacturing consultant helping design a custom product.
Product: {productName}
Category: {category}

Generate 3-5 essential questions about manufacturing requirements.
Focus on: Materials, tolerances, assembly, testing.

Output JSON array of strings:
["Question 1", "Question 2", ...]',
    'Generates manufacturing questions for custom products',
    1
);

-- Comments
COMMENT ON TABLE ai_prompts IS 'Centralized AI prompt template storage';
COMMENT ON COLUMN ai_prompts.template IS 'Prompt template with {variable} placeholders';
COMMENT ON COLUMN ai_prompts.is_frozen IS 'Prevents accidental edits';
COMMENT ON COLUMN ai_prompts.token_usage IS 'Usage statistics and token counts';
