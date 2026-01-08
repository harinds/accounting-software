-- Check user_organizations table and policies
-- Run this in Supabase SQL Editor

-- Check if user_organizations table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_organizations'
) AS table_exists;

-- Show RLS policies on user_organizations
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'user_organizations';

-- Check if there's data for your user
SELECT user_id, organization_id, role, created_at
FROM user_organizations
WHERE organization_id = 'dba6c36e-d921-4ee2-a23c-d54cd372ac91';
