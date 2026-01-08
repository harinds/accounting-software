-- Debug query to check P&L data
-- Run this in Supabase SQL Editor to see what the P&L report should return

-- 1. Check what transactions exist with accounts
SELECT
  t.transaction_date,
  t.type,
  t.amount,
  t.category,
  t.description,
  a.code as account_code,
  a.name as account_name,
  a.type as account_type
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.transaction_date >= '2024-12-01'
  AND t.transaction_date <= '2025-10-31'
ORDER BY t.transaction_date DESC
LIMIT 50;

-- 2. Check transactions with revenue/expense accounts specifically
SELECT
  a.type as account_type,
  a.code,
  a.name,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as total_debits
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE t.transaction_date >= '2024-12-01'
  AND t.transaction_date <= '2025-10-31'
  AND a.type IN ('revenue', 'expense')
GROUP BY a.type, a.code, a.name
ORDER BY a.type, a.code;

-- 3. Simulate what the P&L report query returns
SELECT
  t.*,
  row_to_json(a.*) as accounts
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.organization_id = (SELECT id FROM organizations LIMIT 1)
  AND t.transaction_date >= '2024-12-01'
  AND t.transaction_date <= '2025-10-31'
LIMIT 20;
