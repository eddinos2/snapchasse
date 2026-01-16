-- MVP Setup - Simplified schema without auth dependencies
-- Execute this first to set up all tables for the MVP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role_v1 AS ENUM ('admin', 'participant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for hunt status
DO $$ BEGIN
  CREATE TYPE hunt_status_v1 AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (no auth.users dependency for MVP)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  role user_role_v1 NOT NULL DEFAULT 'participant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create default demo profile for MVP
INSERT INTO profiles (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@snapchasse.fr', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Hunts table
CREATE TABLE IF NOT EXISTS hunts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status hunt_status_v1 NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Steps table (énigmes/étapes)
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  question TEXT,
  answer TEXT,
  order_index INTEGER NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography point for geolocation
  radius_meters INTEGER DEFAULT 50, -- Radius in meters to validate location
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answer_submitted TEXT,
  is_correct BOOLEAN,
  UNIQUE(user_id, step_id)
);

-- Hunt participants table
CREATE TABLE IF NOT EXISTS hunt_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score INTEGER DEFAULT 0,
  UNIQUE(hunt_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hunts_creator ON hunts(creator_id);
CREATE INDEX IF NOT EXISTS idx_hunts_status ON hunts(status);
CREATE INDEX IF NOT EXISTS idx_steps_hunt ON steps(hunt_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON steps(hunt_id, order_index);
CREATE INDEX IF NOT EXISTS idx_steps_location ON steps USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_hunt ON user_progress(hunt_id);
CREATE INDEX IF NOT EXISTS idx_participants_hunt ON hunt_participants(hunt_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON hunt_participants(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hunts_updated_at BEFORE UPDATE ON hunts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update step location (helper for PostGIS)
CREATE OR REPLACE FUNCTION update_step_location(
  step_id_param UUID,
  lon DOUBLE PRECISION,
  lat DOUBLE PRECISION
)
RETURNS VOID AS $$
BEGIN
  UPDATE steps
  SET location = ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  WHERE id = step_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable RLS for MVP (allow public access)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE hunts DISABLE ROW LEVEL SECURITY;
ALTER TABLE steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE hunt_participants DISABLE ROW LEVEL SECURITY;

-- Grant public access for MVP
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON hunts TO anon, authenticated;
GRANT ALL ON steps TO anon, authenticated;
GRANT ALL ON user_progress TO anon, authenticated;
GRANT ALL ON hunt_participants TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- View for hunt statistics
CREATE OR REPLACE VIEW hunt_stats AS
SELECT
  h.id,
  h.title,
  COUNT(DISTINCT hp.user_id) as participant_count,
  COUNT(DISTINCT s.id) as steps_count,
  COUNT(DISTINCT up.id) as completed_steps_count
FROM hunts h
LEFT JOIN hunt_participants hp ON h.id = hp.hunt_id
LEFT JOIN steps s ON h.id = s.hunt_id
LEFT JOIN user_progress up ON h.id = up.hunt_id
GROUP BY h.id, h.title;

GRANT SELECT ON hunt_stats TO anon, authenticated;
