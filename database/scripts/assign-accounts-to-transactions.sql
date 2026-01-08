-- SQL Script to assign accounts to transactions based on category
-- Run this in Supabase SQL Editor

-- Create a temporary mapping table
CREATE TEMP TABLE category_account_map (
  category TEXT,
  account_code TEXT
);

-- Insert category mappings
INSERT INTO category_account_map (category, account_code) VALUES
  -- Revenue categories
  ('Sales', '4000'),
  ('Services', '4020'),
  ('Subscriptions', '4020'),
  ('Training', '4020'),
  ('Support', '4020'),
  ('Development', '4020'),
  ('Maintenance', '4020'),
  ('Projects', '4020'),
  ('Consulting', '4020'),
  ('Integration', '4020'),
  ('Migration', '4020'),
  ('Optimization', '4020'),
  ('Security', '4020'),
  ('Design', '4020'),
  ('Content', '4020'),

  -- Expense categories
  ('Payroll', '6910'),
  ('Rent', '6810'),
  ('Utilities', '6820'),
  ('Hosting', '6300'),
  ('Software', '6310'),
  ('Marketing', '6000'),
  ('Supplies', '6700'),
  ('Insurance', '6400'),
  ('Bank Fees', '6100'),
  ('Contractors', '6500'),
  ('Legal', '6520'),
  ('Professional Services', '6510'),
  ('Equipment', '1550'),
  ('Travel', '7000'),
  ('Entertainment', '7100');

-- Show what will be updated
SELECT
  t.id,
  t.description,
  t.category,
  t.type,
  t.amount,
  a.code as account_code,
  a.name as account_name,
  a.type as account_type
FROM transactions t
LEFT JOIN category_account_map cam ON t.category = cam.category
LEFT JOIN accounts a ON a.code = cam.account_code AND a.organization_id = t.organization_id
WHERE t.account_id IS NULL
  AND t.category IS NOT NULL
ORDER BY t.transaction_date;

-- Update transactions with account_id
UPDATE transactions
SET account_id = a.id
FROM category_account_map cam
JOIN accounts a ON a.code = cam.account_code
WHERE transactions.category = cam.category
  AND transactions.account_id IS NULL
  AND a.organization_id = transactions.organization_id;

-- Show summary
SELECT
  COUNT(*) FILTER (WHERE account_id IS NOT NULL) as assigned_count,
  COUNT(*) FILTER (WHERE account_id IS NULL) as unassigned_count,
  COUNT(*) as total_count
FROM transactions;

-- Drop temp table
DROP TABLE category_account_map;
