-- Migration to add multiple choice questions support
-- Adds options JSONB column to steps table

ALTER TABLE steps
ADD COLUMN IF NOT EXISTS options JSONB;

-- Add comment
COMMENT ON COLUMN steps.options IS 'Options pour questions à choix multiples. Format: {"options": ["Option 1", "Option 2", "Option 3"], "correct": 0}';

-- Example usage:
-- UPDATE steps SET options = '{"options": ["Paris", "Lyon", "Marseille"], "correct": 0}'::jsonb WHERE id = '...';
