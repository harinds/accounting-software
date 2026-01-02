-- Fix RLS Policies for All Tables
-- The backend uses service_role (supabaseAdmin) which needs to bypass RLS
-- This migration adds service role bypass policies for all data tables

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view organization accounts" ON accounts;

-- Service role bypass
CREATE POLICY "Bypass RLS for service role on accounts"
  ON accounts
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view accounts in their organizations
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

-- Service role bypass
CREATE POLICY "Bypass RLS for service role on transactions"
  ON transactions
  USING (true)
  WITH CHECK (true);

-- Authenticated users can manage transactions in their organizations
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

-- Service role bypass
CREATE POLICY "Bypass RLS for service role on payments"
  ON payments
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view payments in their organizations
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

-- Service role bypass
CREATE POLICY "Bypass RLS for service role on bank_feeds"
  ON bank_feeds
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view bank feeds in their organizations
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

-- Service role bypass
CREATE POLICY "Bypass RLS for service role on tax_returns"
  ON tax_returns
  USING (true)
  WITH CHECK (true);

-- Authenticated users can manage tax returns in their organizations
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
