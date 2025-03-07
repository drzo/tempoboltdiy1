-- Create versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  css TEXT NOT NULL,
  js TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  commit_message TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, version_number)
);

-- Enable row level security
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Project owners and collaborators can view versions
DROP POLICY IF EXISTS "Users can view project versions" ON versions;
CREATE POLICY "Users can view project versions"
  ON versions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = project_id
      UNION
      SELECT user_id FROM collaborators WHERE project_id = versions.project_id
    )
  );

-- Only project owners and edit/admin collaborators can create versions
DROP POLICY IF EXISTS "Users can create project versions" ON versions;
CREATE POLICY "Users can create project versions"
  ON versions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = project_id
      UNION
      SELECT user_id FROM collaborators 
      WHERE project_id = versions.project_id 
      AND permission_level IN ('edit', 'admin')
    )
  );

-- Enable realtime subscriptions
alter publication supabase_realtime add table versions;
