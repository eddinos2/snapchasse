-- Migration to add features: stats, leaderboard, share, badges
-- Execute after 000_setup_mvp.sql

-- Add share token and public flag to hunts
ALTER TABLE hunts 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Generate share tokens for existing hunts
UPDATE hunts 
SET share_token = encode(gen_random_bytes(16), 'hex')
WHERE share_token IS NULL;

-- Add completion time and score to user_progress
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS completed_time INTEGER DEFAULT 0; -- Time in seconds

-- Update hunt_participants with score and total_time if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hunt_participants' AND column_name = 'score'
  ) THEN
    ALTER TABLE hunt_participants ADD COLUMN score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hunt_participants' AND column_name = 'total_time'
  ) THEN
    ALTER TABLE hunt_participants ADD COLUMN total_time INTEGER DEFAULT 0; -- Total time in seconds
  END IF;
END $$;

-- Create function to calculate hunt stats
CREATE OR REPLACE FUNCTION calculate_hunt_stats(hunt_id_param UUID)
RETURNS TABLE (
  participant_count BIGINT,
  completion_count BIGINT,
  avg_time DOUBLE PRECISION,
  avg_score DOUBLE PRECISION,
  completion_rate DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT hp.user_id)::BIGINT as participant_count,
    COUNT(DISTINCT CASE 
      WHEN up.id IS NOT NULL AND up.is_correct = true 
      THEN up.user_id 
    END)::BIGINT as completion_count,
    AVG(hp.total_time)::DOUBLE PRECISION as avg_time,
    AVG(hp.score)::DOUBLE PRECISION as avg_score,
    CASE 
      WHEN COUNT(DISTINCT hp.user_id) > 0 
      THEN (COUNT(DISTINCT CASE WHEN up.id IS NOT NULL THEN up.user_id END)::DOUBLE PRECISION / COUNT(DISTINCT hp.user_id)::DOUBLE PRECISION) * 100
      ELSE 0
    END as completion_rate
  FROM hunts h
  LEFT JOIN hunt_participants hp ON h.id = hp.hunt_id
  LEFT JOIN user_progress up ON h.id = up.hunt_id AND up.is_correct = true
  WHERE h.id = hunt_id_param
  GROUP BY h.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for leaderboard
CREATE OR REPLACE VIEW hunt_leaderboard AS
SELECT 
  hp.hunt_id,
  hp.user_id,
  p.email,
  hp.score,
  hp.total_time,
  COUNT(up.id) as steps_completed,
  hp.joined_at,
  ROW_NUMBER() OVER (PARTITION BY hp.hunt_id ORDER BY hp.score DESC, hp.total_time ASC) as rank
FROM hunt_participants hp
LEFT JOIN profiles p ON hp.user_id = p.id
LEFT JOIN user_progress up ON hp.user_id = up.user_id AND hp.hunt_id = up.hunt_id AND up.is_correct = true
GROUP BY hp.hunt_id, hp.user_id, p.email, hp.score, hp.total_time, hp.joined_at;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hunts_share_token ON hunts(share_token);
CREATE INDEX IF NOT EXISTS idx_hunts_is_public ON hunts(is_public);
CREATE INDEX IF NOT EXISTS idx_progress_completed_time ON user_progress(completed_time);
CREATE INDEX IF NOT EXISTS idx_participants_score ON hunt_participants(hunt_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_participants_time ON hunt_participants(hunt_id, total_time ASC);
