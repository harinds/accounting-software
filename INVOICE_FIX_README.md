# Invoice Creation Fix - RLS Policy Issue

## Problem Identified

When you created an invoice through the application (http://localhost:5173/invoices), it was not being saved to the Supabase database.

### Root Cause

The issue was with **Row Level Security (RLS) policies** on the `invoices` table:

1. The backend uses `supabaseAdmin` client (service role key) to interact with the database
2. The `invoices` table had an RLS policy that only checked for `auth.uid()` (authenticated user)
3. Service role operations bypass normal authentication but still respect RLS policies
4. The policy needed a **service role bypass** to allow the backend to insert invoices

This same issue likely affected other tables: `accounts`, `transactions`, `payments`, `bank_feeds`, and `tax_returns`.

## Solution

Created two migration files to fix the RLS policies:

### Migration 005: Fix Invoice RLS
**File:** `database/migrations/005_fix_invoice_rls.sql`

- Adds service role bypass policy for invoices table
- Keeps authenticated user policy for potential direct client access

### Migration 006: Fix All RLS Policies
**File:** `database/migrations/006_fix_all_rls_policies.sql`

- Adds service role bypass policies for all data tables
- Ensures backend operations work correctly
- Maintains security for authenticated users

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Navigate to your project: https://app.supabase.com
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run Migration 005**
   - Click "New Query"
   - Open `database/migrations/005_fix_invoice_rls.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

4. **Run Migration 006**
   - Click "New Query" again
   - Open `database/migrations/006_fix_all_rls_policies.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

### Option 2: Using PowerShell Script

Run the helper script that will open the migration files for you:

```powershell
.\scripts\apply-rls-fix.ps1
```

This script will:
- Verify your .env configuration
- Open both migration files in Notepad
- Provide step-by-step instructions

You'll still need to manually copy-paste the SQL into Supabase SQL Editor.

## Verify the Fix

After applying the migrations:

1. **Check the Policies** (Optional)
   - In Supabase Dashboard, go to: Table Editor > invoices > Policies
   - You should see two policies:
     - "Bypass RLS for service role on invoices"
     - "Users can manage organization invoices"

2. **Test Invoice Creation**
   - Go to http://localhost:5173/invoices
   - Click "New Invoice"
   - Fill in the form with test data:
     - Customer Name: Test Customer
     - Issue Date: Today
     - Due Date: 30 days from now
     - Add at least one line item
   - Click "Save Invoice"
   - Go back to invoice list

3. **Verify in Database**
   - In Supabase Dashboard, go to: Table Editor > invoices
   - You should see your newly created invoice
   - Check that all fields are populated correctly

## Technical Details

### What is RLS?

Row Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in database tables. Supabase uses RLS to implement multi-tenant security.

### Service Role vs Authenticated Users

- **Service Role (Backend)**: Uses `SUPABASE_SERVICE_ROLE_KEY`, has full database access, bypasses auth
- **Authenticated Users (Frontend)**: Uses `SUPABASE_ANON_KEY` + user JWT, limited by RLS policies

### Policy Structure

```sql
-- Bypass for service role (backend operations)
CREATE POLICY "Bypass RLS for service role on invoices"
  ON invoices
  USING (true)
  WITH CHECK (true);

-- Restricted access for authenticated users
CREATE POLICY "Users can manage organization invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));
```

## Files Created

1. **database/migrations/005_fix_invoice_rls.sql** - Fix invoice table RLS
2. **database/migrations/006_fix_all_rls_policies.sql** - Fix all table RLS policies
3. **scripts/apply-rls-fix.ps1** - Helper script for Windows
4. **INVOICE_FIX_README.md** - This documentation

## Troubleshooting

### Issue: "Permission denied" when running SQL

**Solution**: Make sure you're logged into Supabase Dashboard with the project owner account.

### Issue: Policy already exists error

**Solution**: The migrations include `DROP POLICY IF EXISTS` statements, so this shouldn't happen. If it does, manually delete the old policies first.

### Issue: Invoice still not saving after migration

**Solution**:
1. Check browser console (F12) for errors
2. Check backend logs for errors
3. Verify the organization_id is being sent correctly
4. Check that both migrations were applied successfully

### Issue: Cannot find migration files

**Solution**: Make sure you're in the project root directory:
```powershell
cd c:\Users\the quiet australian\accounting-software
```

## Next Steps

After fixing the invoice creation:

1. Test all invoice features:
   - Create invoice
   - Edit invoice (draft only)
   - View invoice
   - Mark as sent
   - Mark as paid
   - Delete invoice

2. Verify other features still work:
   - Transactions
   - Accounts
   - Reports

3. Consider Phase 8: Enhanced Dashboard with charts and widgets

## Contact

If you encounter issues after applying these migrations, check:
- Browser console (F12 > Console tab)
- Network tab (F12 > Network tab)
- Backend logs (if running locally)
- Supabase logs (Dashboard > Logs)
