# 🚨 QUICK FIX - Apply This Now

## The Problem
Your invoice isn't saving because the database RLS (Row Level Security) policies are blocking the backend from inserting data.

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy and Run the SQL
1. Open this file: **`database/migrations/FIX_INVOICE_RLS_COMBINED.sql`**
2. Copy the **entire contents** (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for "Success" message at the bottom

### Step 3: Test Invoice Creation
1. Go back to http://localhost:5173/invoices
2. Click "New Invoice"
3. Create a test invoice:
   - Customer Name: Test Customer
   - Issue Date: Today
   - Due Date: 30 days from now
   - Add a line item (Description: "Test Service", Quantity: 1, Price: 100)
4. Click "Save Invoice"
5. **The invoice should now save successfully!**

### Step 4: Verify in Database
1. In Supabase Dashboard, go to **Table Editor** > **invoices**
2. You should see your invoice in the table
3. Check that all the data is there

## What This Fix Does

The SQL migration adds "service role bypass" policies to all tables. This allows your backend (which uses the service role key) to create, read, update, and delete data properly.

**Before fix:**
```
Backend tries to insert invoice → RLS blocks it → No error shown → Invoice disappears
```

**After fix:**
```
Backend tries to insert invoice → RLS allows service role → Invoice saved ✅
```

## If You See an Error

### "Policy already exists"
- This is fine, the migration includes `DROP POLICY IF EXISTS` to handle this
- The existing policy will be replaced with the correct one

### "Permission denied"
- Make sure you're logged into Supabase with the project owner account
- Check that you selected the correct project

### Still not saving after running SQL
1. Check the browser console (F12 → Console tab) for error messages
2. Check the Network tab (F12 → Network tab) to see if the API call succeeded
3. Verify the SQL ran successfully (you should see a success message)

## Files Reference

- **The SQL to run:** `database/migrations/FIX_INVOICE_RLS_COMBINED.sql`
- **Full documentation:** `INVOICE_FIX_README.md`
- **Helper script:** `scripts/apply-rls-fix.ps1`

---

**After applying this fix, your invoices (and all other data) will save correctly!**
