-- Create organization and link to your user
-- Run this SQL in Supabase SQL Editor

-- Step 1: Get your user ID (replace with your actual email)
-- You can find your user ID in Supabase > Authentication > Users
-- Or run: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Create user record and organization with a proper UUID
DO $$
DECLARE
  org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';  -- Fixed UUID for consistency
BEGIN
  -- First, ensure user exists in users table (sync from auth.users)
  INSERT INTO users (id, email, full_name, created_at, updated_at)
  SELECT
    id,
    email,
    raw_user_meta_data->>'full_name',
    created_at,
    updated_at
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM users)
  LIMIT 1;

  -- Create organization
  INSERT INTO organizations (id, name, abn, address, settings, created_at, updated_at)
  VALUES (
    org_id,
    'My Accounting Business',
    '12345678901',
    jsonb_build_object(
      'street', '123 Main Street',
      'city', 'Sydney',
      'state', 'NSW',
      'postcode', '2000',
      'country', 'Australia'
    ),
    jsonb_build_object(
      'currency', 'AUD',
      'timezone', 'Australia/Sydney',
      'financial_year_end', '06-30'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Link the user to the organization
  INSERT INTO user_organizations (user_id, organization_id, role, created_at)
  SELECT
    id,
    org_id,
    'owner',
    NOW()
  FROM users
  WHERE id NOT IN (
    SELECT user_id FROM user_organizations WHERE organization_id = org_id
  )
  LIMIT 1;
END $$;

-- Verify the setup and show the organization ID
SELECT
  u.email,
  o.id as organization_id,
  o.name as organization_name,
  uo.role
FROM auth.users u
JOIN user_organizations uo ON u.id = uo.user_id
JOIN organizations o ON uo.organization_id = o.id
WHERE o.name = 'My Accounting Business';
