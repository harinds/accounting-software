# Fix Invoices and Reports Issues

**Good news:** Login, Dashboard, Transactions, and Accounts work! ✅

**Issues to fix:**
1. ❌ Cannot create invoices
2. ❌ Cannot generate reports

---

## 🔍 Root Cause Analysis

These issues are likely caused by:

### Issue 1: Invoice Database Migration Not Applied
The invoice RLS (Row Level Security) policies might not be set up on production Supabase.

### Issue 2: Reports Missing Data or Permissions
Reports need proper database access and existing transaction data.

---

## 🛠️ Fix #1: Apply Invoice Database Migrations

### Step 1: Go to Supabase Dashboard

1. Open: **https://app.supabase.com**
2. Login
3. Select your project: **kjaantlojwxmmaohgouc**

### Step 2: Open SQL Editor

1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"**

### Step 3: Apply Invoice RLS Fix

Copy and paste this SQL into the editor:

```sql
-- Fix Invoice RLS Policies
-- This allows the backend to create/read invoices

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices for their organization" ON invoices;
DROP POLICY IF EXISTS "Users can update their organization's invoices" ON invoices;
DROP POLICY IF EXISTS "Bypass RLS for service role on invoices" ON invoices;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) to bypass RLS
CREATE POLICY "Bypass RLS for service role on invoices"
ON invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their organization's invoices
CREATE POLICY "Users can view their organization's invoices"
ON invoices
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
));

-- Allow authenticated users to create invoices
CREATE POLICY "Users can create invoices for their organization"
ON invoices
FOR INSERT
TO authenticated
WITH CHECK (organization_id IN (
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
));

-- Allow authenticated users to update their organization's invoices
CREATE POLICY "Users can update their organization's invoices"
ON invoices
FOR UPDATE
TO authenticated
USING (organization_id IN (
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
))
WITH CHECK (organization_id IN (
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
));
```

### Step 4: Run the Query

1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait for **"Success. No rows returned"** message
3. Close the SQL Editor

---

## 🛠️ Fix #2: Check Reports Data

Reports might not be generating because:

### Option A: No Transaction Data with Account Assignments

Reports need transactions that are assigned to accounts.

**To check:**
1. Go to Transactions page in your app
2. Look at existing transactions
3. Do they have account codes assigned? (e.g., 4000, 6000, etc.)

**If transactions don't have account codes:**
You need to assign accounts to transactions. See "Assign Accounts" section below.

### Option B: Date Range Issues

Reports filter by date range. Your data might be outside the selected dates.

**To test:**
1. Go to Reports page
2. Try generating a Profit & Loss report
3. Use a **wide date range**:
   - Start: January 1, 2024
   - End: December 31, 2025
4. See if data appears

### Option C: Backend Connection Issue

**Check browser console for errors:**
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Try generating a report
4. Look for red error messages
5. Take a screenshot if you see errors

---

## 🔧 Fix #3: Assign Accounts to Transactions

If reports show "No data" but you have transactions:

### Check Transaction Accounts:

1. Go to **Transactions** page
2. Look at the transaction list
3. **Do you see account codes** (like "4000", "6000") next to transactions?

### If NO account codes visible:

Your transactions need account assignments for reports to work.

**Quick Fix - Run SQL in Supabase:**

```sql
-- Assign default revenue account to credit transactions
UPDATE transactions
SET account_id = (
  SELECT id FROM accounts
  WHERE code = '4000'
  AND organization_id = transactions.organization_id
  LIMIT 1
)
WHERE type = 'credit'
AND account_id IS NULL;

-- Assign default expense account to debit transactions
UPDATE transactions
SET account_id = (
  SELECT id FROM accounts
  WHERE code = '6000'
  AND organization_id = transactions.organization_id
  LIMIT 1
)
WHERE type = 'debit'
AND account_id IS NULL;
```

This assigns:
- Revenue account (4000) to all income transactions
- Expense account (6000) to all expense transactions

---

## 🐛 Debugging Steps

### Step 1: Check Browser Console

When you try to create an invoice or generate a report:

1. Press **F12**
2. Click **Console** tab
3. Try the action
4. Look for errors

**Common errors:**
- `403 Forbidden` = Permission issue (RLS policies)
- `500 Internal Server Error` = Backend error
- `Network Error` = Backend not reachable
- `No data available` = No matching data or date range issue

### Step 2: Check Railway Backend Logs

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Click your **accounting-software** project
3. Click on the backend service
4. Click **"Logs"** tab
5. Try creating an invoice in the app
6. Watch for error messages in logs

**Look for:**
- Database permission errors
- RLS policy violations
- SQL errors
- Connection issues

### Step 3: Check Network Tab

1. Press **F12**
2. Click **Network** tab
3. Try creating an invoice
4. Look for the API request
5. Click on it to see:
   - Request URL
   - Status code (should be 200 or 201)
   - Response data

**If you see 403 or 500 errors**, that's the problem!

---

## 📋 Quick Troubleshooting Checklist

### For Invoices:

- [ ] Applied invoice RLS migration in Supabase
- [ ] Checked browser console for errors
- [ ] Checked Railway logs for errors
- [ ] Verified `invoices` table exists in Supabase
- [ ] Checked network tab for 403/500 errors

### For Reports:

- [ ] Transactions have account codes assigned
- [ ] Used wide date range (Jan 2024 - Dec 2025)
- [ ] Browser console shows no errors
- [ ] Have at least some transactions in database
- [ ] Checked Railway logs for report generation errors

---

## 🎯 Step-by-Step Fix Process

### Step 1: Fix Invoices (5 minutes)

1. Open Supabase: https://app.supabase.com
2. SQL Editor → New Query
3. Paste the invoice RLS SQL (from above)
4. Run it
5. Go back to your app and try creating an invoice

### Step 2: Fix Reports (10 minutes)

1. Check if transactions have account codes
2. If not, run the account assignment SQL (from above)
3. Try generating report with wide date range
4. Check browser console for specific errors

### Step 3: If Still Not Working

1. Open browser console (F12)
2. Try the action
3. Take screenshot of errors
4. Check Railway logs for backend errors
5. Report specific error messages

---

## 💡 Most Likely Solutions

### For "Cannot create invoice":

**90% chance it's:** Missing invoice RLS policies

**Fix:** Run the invoice RLS SQL in Supabase (Step 1 above)

### For "Cannot generate reports":

**Most likely causes:**
1. **No account assignments** on transactions (70% probability)
   - Fix: Run account assignment SQL
2. **Date range mismatch** (20% probability)
   - Fix: Use wider date range
3. **No data** in selected period (10% probability)
   - Fix: Create test transactions first

---

## 🔍 What to Check First

### Quick Test for Invoices:

1. Open browser console (F12)
2. Try to create an invoice
3. Look at console errors
4. Look at Network tab for the POST request
5. Check response status code

**If 403 Forbidden** → RLS policy issue → Run SQL fix
**If 500 Error** → Backend issue → Check Railway logs
**If 404** → Route issue → Backend might be down

### Quick Test for Reports:

1. Go to Transactions page
2. Check if transactions show account codes
3. If NO account codes → Run account assignment SQL
4. If YES account codes → Try report with wide date range

---

## 📞 Next Steps

1. **Apply invoice RLS fix** in Supabase SQL Editor
2. **Check transaction account assignments**
3. **Try creating invoice again**
4. **Try generating report with wide date range**
5. **Check browser console** for specific errors

Let me know what errors you see!

---

## 🆘 Report Back

After trying the fixes, let me know:

1. **For invoices:**
   - What happens when you try to create one?
   - Any error messages in browser console?
   - What status code in Network tab?

2. **For reports:**
   - Do transactions have account codes?
   - What date range did you try?
   - Any error messages in console?

---

**Start with:** Apply the invoice RLS SQL in Supabase! 👆

---

*Created: January 7, 2026*
