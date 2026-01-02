# Laptop Deployment Guide - Phase 7 Update

**Date:** 2026-01-02
**Phase:** 7 - Invoice Management with Automatic Transaction Creation

---

## 📋 What's New in This Update

### Features Added:
- ✅ Complete invoice management system
- ✅ Automatic transaction creation when invoices are paid
- ✅ Professional print-ready invoice layout
- ✅ Invoice status workflow (draft → sent → paid)
- ✅ Automatic invoice numbering (INV-0001, INV-0002...)
- ✅ GST calculation (10%)
- ✅ Dynamic line items

---

## 🚀 Deployment Steps for Laptop

### Step 1: Pull Latest Changes from GitHub

```bash
cd /path/to/accounting-software
git pull origin master
```

### Step 2: Install New Dependencies (if any)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 3: Apply Database Migrations

**IMPORTANT:** You must apply the RLS (Row Level Security) fixes for invoices to work.

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Open the file: `database/migrations/FIX_INVOICE_RLS_COMBINED.sql`
6. Copy the **entire contents**
7. Paste into Supabase SQL Editor
8. Click **"Run"** (or press Ctrl+Enter)
9. Wait for "Success" message

#### Option B: Using Helper Script

```bash
cd database/migrations
# Manually copy the contents of FIX_INVOICE_RLS_COMBINED.sql
# and paste into Supabase SQL Editor
```

### Step 4: Verify Environment Variables

Make sure your `.env` files are configured correctly:

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Test the New Features

1. **Log in** to the application
2. **Navigate to Invoices** (left sidebar)
3. **Create a test invoice:**
   - Click "New Invoice"
   - Fill in customer details
   - Add line items
   - Save
4. **Mark invoice as Sent**
5. **Mark invoice as Paid**
6. **Verify transaction was created:**
   - Go to Dashboard - check "Recent Transactions"
   - Go to Transactions page - verify invoice payment appears
   - Check the amount matches the invoice total

---

## 🔍 Verification Checklist

After deployment, verify these work:

- [ ] Can create new invoice
- [ ] Invoice appears in invoice list
- [ ] Can mark invoice as "Sent"
- [ ] Can mark invoice as "Paid"
- [ ] Transaction automatically created when marked as paid
- [ ] Transaction appears on Dashboard
- [ ] Transaction appears on Transactions page
- [ ] Print button works (no sidebar in print)
- [ ] Invoice calculations correct (subtotal + GST = total)

---

## 🐛 Troubleshooting

### Issue: Invoice doesn't save to database

**Solution:**
- Make sure you ran the `FIX_INVOICE_RLS_COMBINED.sql` migration
- Check Supabase Dashboard → Table Editor → invoices → Policies
- Should see "Bypass RLS for service role on invoices" policy

### Issue: Transaction not created when marking as paid

**Solution:**
- Check browser console (F12) for errors
- Check backend logs for errors
- Verify backend was restarted after pulling changes
- Ensure Sales Revenue account (code 4000) exists

### Issue: Rate limiting errors (429)

**Solution:**
- Backend already updated with higher dev limits (1000 req/15min)
- Restart backend server
- If still occurring, wait 15 minutes for rate limit to reset

### Issue: Print shows sidebar

**Solution:**
- Make sure you pulled latest frontend code
- Hard refresh browser (Ctrl+Shift+R)
- Sidebar should hide when printing

---

## 📦 Files Changed in This Update

### Backend Files:
- `backend/src/services/invoice.service.ts` (NEW)
- `backend/src/routes/invoice.routes.ts` (NEW)
- `backend/src/server.ts` (MODIFIED - added invoice routes)
- `backend/src/middleware/rateLimiter.ts` (MODIFIED - increased dev limits)

### Frontend Files:
- `frontend/src/pages/Invoices.tsx` (NEW)
- `frontend/src/pages/InvoiceForm.tsx` (NEW)
- `frontend/src/pages/InvoiceView.tsx` (NEW)
- `frontend/src/App.tsx` (MODIFIED - added invoice routes)
- `frontend/src/components/Layout.tsx` (MODIFIED - print styles)

### Database Migrations:
- `database/migrations/005_fix_invoice_rls.sql` (NEW)
- `database/migrations/006_fix_all_rls_policies.sql` (NEW)
- `database/migrations/FIX_INVOICE_RLS_COMBINED.sql` (NEW - **MUST RUN**)

### Documentation:
- `PHASE_7_COMPLETION_SUMMARY.md` (NEW)
- `INVOICE_FIX_README.md` (NEW)
- `APPLY_FIX_NOW.md` (NEW)
- `LAPTOP_DEPLOYMENT_GUIDE.md` (NEW - this file)

---

## 🎯 Post-Deployment Tasks

After successful deployment:

1. **Test with real data:**
   - Create actual customer invoices
   - Mark them as sent/paid
   - Verify accounting records are correct

2. **Backup database:**
   - Go to Supabase Dashboard
   - Settings → Database → Backups
   - Ensure automatic backups are enabled

3. **Monitor logs:**
   - Check backend logs for any errors
   - Check browser console for frontend errors

---

## 📊 Database Schema Note

The `invoices` table already existed in your database from the initial schema migration. This update adds:
- ✅ Proper RLS policies for service role
- ✅ Backend logic to use the table
- ✅ Frontend UI to manage invoices
- ✅ Automatic transaction creation on payment

---

## 🔐 Security Notes

- RLS policies properly configured for multi-tenant security
- Service role bypass only for backend operations
- Frontend users still restricted to their organization data
- Rate limiting protects against abuse

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review INVOICE_FIX_README.md for detailed RLS policy explanation
3. Check browser console and backend logs
4. Verify all migration SQL was applied successfully

---

## ✅ Deployment Complete!

Once you've followed all steps and verified the checklist, Phase 7 is deployed and ready to use!

**Next recommended phase:** Phase 8 - Enhanced Dashboard with charts and analytics
