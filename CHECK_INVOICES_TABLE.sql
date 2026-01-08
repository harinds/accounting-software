-- Check if invoices table exists and its structure
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'invoices'
) AS invoices_table_exists;

-- If it exists, show its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'invoices';
