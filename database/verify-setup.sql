-- Verify what users and organizations exist

-- Check all users
SELECT 'Users in users table:' as info;
SELECT id, email, full_name FROM users;

-- Check all organizations
SELECT 'Organizations:' as info;
SELECT id, name FROM organizations;

-- Check all user-organization links
SELECT 'User-Organization links:' as info;
SELECT
  uo.user_id,
  u.email,
  uo.organization_id,
  o.name as org_name,
  uo.role
FROM user_organizations uo
LEFT JOIN users u ON uo.user_id = u.id
LEFT JOIN organizations o ON uo.organization_id = o.id;

-- Check auth.users (Supabase auth table)
SELECT 'Auth users:' as info;
SELECT id, email FROM auth.users;
