-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  UNIQUE(project_id, user_id)
);

-- Enable row level security
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Project owners can manage collaborators
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON collaborators;
CREATE POLICY "Project owners can manage collaborators"
  ON collaborators FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = project_id
    )
  );

-- Users can view collaborations they're part of
DROP POLICY IF EXISTS "Users can view their collaborations" ON collaborators;
CREATE POLICY "Users can view their collaborations"
  ON collaborators FOR SELECT
  USING (user_id = auth.uid());

-- Enable realtime subscriptions
alter publication supabase_realtime add table collaborators;

-- Create function to get user email by ID (for collaborator management)
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  RETURN user_email;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user ID by email (for adding collaborators)
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_address TEXT)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;
