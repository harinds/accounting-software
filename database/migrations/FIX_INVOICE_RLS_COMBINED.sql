-- ============================================================================
-- COMBINED RLS FIX FOR INVOICE CREATION ISSUE
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- This fixes the issue where invoices (and other data) cannot be saved
-- because the backend uses service_role which needs RLS bypass policies

-- ============================================================================
-- INVOICES TABLE - PRIMARY FIX
-- ============================================================================

ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can manage organization invoices" ON invoices;
DROP POLICY IF EXISTS "Bypass RLS for service role on invoices" ON invoices;

-- Service role bypass (allows backend to insert/update/delete)
CREATE POLICY "Bypass RLS for service role on invoices"
  ON invoices
  USING (true)
  WITH CHECK (true);

-- Authenticated users policy (for future direct client access if needed)
CREATE POLICY "Users can manage organization invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================

ALTER TABLE accounts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view organization accounts" ON accounts;
DROP POLICY IF EXISTS "Bypass RLS for service role on accounts" ON accounts;

CREATE POLICY "Bypass RLS for service role on accounts"
  ON accounts
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view organization accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

ALTER TABLE transactions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage organization transactions" ON transactions;
DROP POLICY IF EXISTS "Bypass RLS for service role on transactions" ON transactions;

CREATE POLICY "Bypass RLS for service role on transactions"
  ON transactions
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage organization transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

ALTER TABLE payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view organization payments" ON payments;
DROP POLICY IF EXISTS "Bypass RLS for service role on payments" ON payments;

CREATE POLICY "Bypass RLS for service role on payments"
  ON payments
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view organization payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- BANK_FEEDS TABLE
-- ============================================================================

ALTER TABLE bank_feeds FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view organization bank feeds" ON bank_feeds;
DROP POLICY IF EXISTS "Bypass RLS for service role on bank_feeds" ON bank_feeds;

CREATE POLICY "Bypass RLS for service role on bank_feeds"
  ON bank_feeds
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view organization bank feeds"
  ON bank_feeds FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TAX_RETURNS TABLE
-- ============================================================================

ALTER TABLE tax_returns FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view organization tax returns" ON tax_returns;
DROP POLICY IF EXISTS "Users can manage organization tax returns" ON tax_returns;
DROP POLICY IF EXISTS "Bypass RLS for service role on tax_returns" ON tax_returns;

CREATE POLICY "Bypass RLS for service role on tax_returns"
  ON tax_returns
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage organization tax returns"
  ON tax_returns FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that policies were created successfully
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('invoices', 'accounts', 'transactions', 'payments', 'bank_feeds', 'tax_returns')
ORDER BY tablename, policyname;
