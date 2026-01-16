-- Migration to add hints system to steps table
-- Adds progressive hints (3 levels) with cost system

ALTER TABLE steps
ADD COLUMN IF NOT EXISTS hint_1 TEXT,
ADD COLUMN IF NOT EXISTS hint_2 TEXT,
ADD COLUMN IF NOT EXISTS hint_3 TEXT,
ADD COLUMN IF NOT EXISTS hint_cost INTEGER DEFAULT 10; -- Points cost per hint

-- Add comment
COMMENT ON COLUMN steps.hint_1 IS 'Premier indice (facile)';
COMMENT ON COLUMN steps.hint_2 IS 'Deuxième indice (moyen)';
COMMENT ON COLUMN steps.hint_3 IS 'Troisième indice (précis)';
COMMENT ON COLUMN steps.hint_cost IS 'Coût en points pour chaque indice utilisé';

-- Add index for better queries
CREATE INDEX IF NOT EXISTS idx_steps_hints ON steps(hunt_id) WHERE hint_1 IS NOT NULL;
