-- Fix RLS Policies for User Creation
-- This allows the service role to create users during registration

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Allow service role to insert users (needed for registration)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can view their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to insert organizations
DROP POLICY IF EXISTS "Service role can insert organizations" ON organizations;
CREATE POLICY "Service role can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert user_organizations
DROP POLICY IF EXISTS "Service role can insert user_organizations" ON user_organizations;
CREATE POLICY "Service role can insert user_organizations"
  ON user_organizations FOR INSERT
  WITH CHECK (true);

-- Users can view their user_organization links
DROP POLICY IF EXISTS "Users can view their organization links" ON user_organizations;
CREATE POLICY "Users can view their organization links"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());
