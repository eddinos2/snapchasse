-- Migration pour désactiver l'auth et permettre l'accès public pour le MVP
-- Cette migration modifie les RLS policies pour permettre l'accès sans authentification

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active hunts" ON hunts;
DROP POLICY IF EXISTS "Admins and creators can create hunts" ON hunts;
DROP POLICY IF EXISTS "Admins and creators can update hunts" ON hunts;
DROP POLICY IF EXISTS "Admins and creators can delete hunts" ON hunts;
DROP POLICY IF EXISTS "Users can view steps of accessible hunts" ON steps;
DROP POLICY IF EXISTS "Admins and hunt creators can manage steps" ON steps;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can create their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view participants of accessible hunts" ON hunt_participants;
DROP POLICY IF EXISTS "Users can join hunts" ON hunt_participants;

-- New policies for MVP (no auth required)
-- Profiles: allow public read, but only insert/update for demo profile
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for demo profile"
  ON profiles FOR INSERT
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Allow update for demo profile"
  ON profiles FOR UPDATE
  USING (id = '00000000-0000-0000-0000-000000000000');

-- Hunts: allow public read and create
CREATE POLICY "Anyone can view hunts"
  ON hunts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create hunts"
  ON hunts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update hunts"
  ON hunts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete hunts"
  ON hunts FOR DELETE
  USING (true);

-- Steps: allow public access
CREATE POLICY "Anyone can view steps"
  ON steps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage steps"
  ON steps FOR ALL
  USING (true);

-- User progress: allow public access
CREATE POLICY "Anyone can view progress"
  ON user_progress FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);

-- Hunt participants: allow public access
CREATE POLICY "Anyone can view participants"
  ON hunt_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join hunts"
  ON hunt_participants FOR INSERT
  WITH CHECK (true);
