-- Fix user_organizations RLS policy
-- The bypass policy has the wrong role (public instead of service_role)
-- This prevents the backend from accessing the table

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Bypass RLS for service role on user_organizations" ON user_organizations;

-- Create the correct policy with service_role
CREATE POLICY "Bypass RLS for service role on user_organizations"
  ON user_organizations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify the fix
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'user_organizations';
