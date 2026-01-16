-- GDPR compliance tables and functions

-- User consents table
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'cookies', 'analytics', 'marketing'
  granted BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- Data requests table (for GDPR requests)
CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL, -- 'access', 'export', 'deletion', 'rectification'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_user_id ON data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_requests_updated_at
  BEFORE UPDATE ON data_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own consents
CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents
CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own data requests
CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data requests
CREATE POLICY "Users can insert own data requests"
  ON data_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to export user data (for GDPR right to data portability)
CREATE OR REPLACE FUNCTION export_user_data(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user', (SELECT row_to_json(u) FROM auth.users u WHERE u.id = user_id_param),
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = user_id_param),
    'consents', (SELECT json_agg(row_to_json(c)) FROM user_consents c WHERE c.user_id = user_id_param),
    'data_requests', (SELECT json_agg(row_to_json(d)) FROM data_requests d WHERE d.user_id = user_id_param),
    'hunts_created', (SELECT json_agg(row_to_json(h)) FROM hunts h WHERE h.creator_id = user_id_param),
    'progress', (SELECT json_agg(row_to_json(up)) FROM user_progress up WHERE up.user_id = user_id_param)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION export_user_data(UUID) TO authenticated;
