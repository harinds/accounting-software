-- Fix RLS Policies for Invoices Table
-- The backend uses service_role (supabaseAdmin) which needs to bypass RLS
-- This migration adds a service role bypass policy for the invoices table

-- Ensure RLS is enabled
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Drop the old policy
DROP POLICY IF EXISTS "Users can manage organization invoices" ON invoices;

-- Create service role bypass policy (for backend operations using supabaseAdmin)
CREATE POLICY "Bypass RLS for service role on invoices"
  ON invoices
  USING (true)
  WITH CHECK (true);

-- Create authenticated user policy for direct client access (if needed in future)
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
