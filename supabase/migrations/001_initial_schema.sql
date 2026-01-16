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

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role user_role_v1 NOT NULL DEFAULT 'participant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'participant');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create app schema if not exists
CREATE SCHEMA IF NOT EXISTS app;

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hunt_participants ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION app.role()
RETURNS user_role_v1 AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS BOOLEAN AS $$
  SELECT app.role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Hunts policies
CREATE POLICY "Anyone can view active hunts"
  ON hunts FOR SELECT
  USING (status = 'active' OR creator_id = auth.uid() OR app.is_admin());

CREATE POLICY "Admins and creators can create hunts"
  ON hunts FOR INSERT
  WITH CHECK (app.is_admin() OR auth.uid() = creator_id);

CREATE POLICY "Admins and creators can update hunts"
  ON hunts FOR UPDATE
  USING (app.is_admin() OR creator_id = auth.uid());

CREATE POLICY "Admins and creators can delete hunts"
  ON hunts FOR DELETE
  USING (app.is_admin() OR creator_id = auth.uid());

-- Steps policies
CREATE POLICY "Users can view steps of accessible hunts"
  ON steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = steps.hunt_id
      AND (hunts.status = 'active' OR hunts.creator_id = auth.uid() OR app.is_admin())
    )
  );

CREATE POLICY "Admins and hunt creators can manage steps"
  ON steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = steps.hunt_id
      AND (app.is_admin() OR hunts.creator_id = auth.uid())
    )
  );

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Hunt participants policies
CREATE POLICY "Users can view participants of accessible hunts"
  ON hunt_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hunts
      WHERE hunts.id = hunt_participants.hunt_id
      AND (hunts.status = 'active' OR hunts.creator_id = auth.uid() OR app.is_admin())
    )
  );

CREATE POLICY "Users can join hunts"
  ON hunt_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
