-- ============================================================================
-- INVOICE RLS FIX - Run this in Supabase SQL Editor
-- ============================================================================
-- This fixes the "internal server error" when creating invoices
-- The backend needs service_role bypass policies to insert data
-- ============================================================================

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
  FOR ALL
  TO service_role
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
-- VERIFICATION - Check that policies were created
-- ============================================================================

SELECT
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'invoices'
ORDER BY policyname;
