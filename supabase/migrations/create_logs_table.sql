-- Create logs table for platform activity tracking
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Classification
    log_type TEXT NOT NULL CHECK (log_type IN ('error', 'supplier_action', 'project_action', 'rfq_generation', 'ai_call')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    
    -- Context references
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    supplier_id UUID, -- References partners table (no FK constraint to avoid coupling)
    
    -- Error categorization
    error_type TEXT, -- e.g., 'validation_error', 'api_timeout', 'database_error'
    
    -- Log content
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Stack traces, API responses, additional context
    
    -- Search and filtering
    CONSTRAINT logs_log_type_check CHECK (log_type IN ('error', 'supplier_action', 'project_action', 'rfq_generation', 'ai_call')),
    CONSTRAINT logs_severity_check CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_log_type ON logs(log_type);
CREATE INDEX IF NOT EXISTS idx_logs_severity ON logs(severity);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON logs(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_supplier_id ON logs(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_error_type ON logs(error_type) WHERE error_type IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_logs_type_created ON logs(log_type, created_at DESC);

-- Comments
COMMENT ON TABLE logs IS 'Platform activity and error logs for admin monitoring';
COMMENT ON COLUMN logs.log_type IS 'Category of log: error, supplier_action, project_action, rfq_generation, ai_call';
COMMENT ON COLUMN logs.severity IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN logs.metadata IS 'Additional context in JSON format (stack traces, API responses, etc.)';
COMMENT ON COLUMN logs.error_type IS 'Sub-category for errors (e.g., validation_error, api_timeout)';

-- Insert sample logs for testing
INSERT INTO logs (log_type, severity, message, metadata) VALUES
    ('error', 'critical', 'Failed to connect to OpenAI API', '{"error": "ECONNREFUSED", "endpoint": "/v1/chat/completions"}'),
    ('supplier_action', 'info', 'Supplier approved by admin', '{"supplier_name": "Test Supplier", "admin_action": "approve"}'),
    ('project_action', 'info', 'New project created', '{"project_name": "Sample Project", "category": "electronics"}'),
    ('rfq_generation', 'info', 'RFQ sent to 5 suppliers', '{"project_id": "sample-uuid", "supplier_count": 5}'),
    ('ai_call', 'info', 'Playbook generated successfully', '{"model": "gpt-4", "tokens": 1250, "duration_ms": 3500}');
