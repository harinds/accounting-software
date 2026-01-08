-- Bypass RLS for Service Role on Critical Tables
-- This allows the backend (using service_role key) to create users and organizations

-- For users table - allow service role to bypass RLS
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Service role bypass (backend operations)
CREATE POLICY "Bypass RLS for service role on users"
  ON users
  USING (true)
  WITH CHECK (true);

-- Users can view their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- For organizations table - allow service role to bypass RLS
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Service role bypass (backend operations)
CREATE POLICY "Bypass RLS for service role on organizations"
  ON organizations
  USING (true)
  WITH CHECK (true);

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- For user_organizations table - allow service role to bypass RLS
ALTER TABLE user_organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert user_organizations" ON user_organizations;
DROP POLICY IF EXISTS "Users can view their organization links" ON user_organizations;

-- Service role bypass (backend operations)
CREATE POLICY "Bypass RLS for service role on user_organizations"
  ON user_organizations
  USING (true)
  WITH CHECK (true);

-- Users can view their organization links
CREATE POLICY "Users can view their organization links"
  ON user_organizations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
