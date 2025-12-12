-- Link the localhost.gave777@passinbox.com user to the organization

INSERT INTO user_organizations (user_id, organization_id, role, created_at)
VALUES (
  'f9d424fc-05c6-4e95-84f8-71d933d16e30',  -- Your actual user ID
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- Organization ID
  'owner',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify the link
SELECT
  u.email,
  o.name as organization_name,
  uo.role
FROM user_organizations uo
JOIN users u ON uo.user_id = u.id
JOIN organizations o ON uo.organization_id = o.id
WHERE u.email = 'localhost.gave777@passinbox.com';
