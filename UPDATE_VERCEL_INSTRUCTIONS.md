# Update Vercel with Railway Backend URL

**Your Railway Backend URL:** `https://accounting-software-production.up.railway.app`

Now let's connect your Vercel frontend to this backend!

---

## 🎯 Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard

Open this URL in your browser:
**https://vercel.com/dashboard**

Login if needed (same account you used to deploy from laptop).

### Step 2: Find Your Frontend Project

You should see your projects listed. Look for:
- **frontend-eight-eosin-75** (or similar name)
- Or the project with URL: `frontend-eight-eosin-75.vercel.app`

**Click on that project.**

### Step 3: Go to Settings

Once inside the project, look at the top navigation tabs:
- Overview
- Deployments
- Analytics
- Logs
- **Settings** ← Click this one

### Step 4: Click "Environment Variables"

In the Settings page, you'll see a left sidebar with options:
- General
- Domains
- **Environment Variables** ← Click this one
- Git
- Functions
- (etc.)

### Step 5: Find VITE_API_URL

Scroll through the list of environment variables. Look for:
```
VITE_API_URL
```

You should see it listed with its current value (probably `http://localhost:3001` or an old URL).

**Click the three dots (...) or "Edit" button next to it.**

### Step 6: Update the Value

In the edit dialog:

1. **Current value might be:**
   - `http://localhost:3001`
   - Or some other URL

2. **Replace it with:**
   ```
   https://accounting-software-production.up.railway.app
   ```

3. **Important Notes:**
   - ✅ Include `https://` at the start
   - ❌ NO trailing slash at the end
   - ✅ Exact URL: `https://accounting-software-production.up.railway.app`

4. **Click "Save"**

### Step 7: Verify Other Environment Variables

While you're here, check these are also set:

**VITE_SUPABASE_URL:**
```
https://kjaantlojwxmmaohgouc.supabase.co
```

**VITE_SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A
```

If these are missing, add them using the "Add" button.

### Step 8: Redeploy

After saving the environment variable:

1. **Go back to the project overview** (click project name at top)

2. **Click "Deployments" tab** (top navigation)

3. **Find the latest deployment** (should be at the top)

4. **Click the three dots (...) menu** on the right side of that deployment

5. **Click "Redeploy"**

6. **Confirm "Redeploy"** in the popup

7. **Wait for deployment** (usually 1-2 minutes)
   - Status will show: "Building" → "Ready"
   - Green checkmark when complete

---

## ✅ Summary of What You're Updating

**Variable Name:**
```
VITE_API_URL
```

**New Value:**
```
https://accounting-software-production.up.railway.app
```

**Action:**
- Edit the variable
- Save
- Redeploy

---

## 🖼️ Visual Guide

### What You'll See in Environment Variables:

```
┌────────────────────────────────────────────────────┐
│  Environment Variables                             │
├────────────────────────────────────────────────────┤
│                                                    │
│  VITE_API_URL                                      │
│  Value: http://localhost:3001                      │
│  [Edit] [Delete]                            ← Click Edit
│                                                    │
│  VITE_SUPABASE_URL                                 │
│  Value: https://kjaantlojwxmmaohgouc.supabase.co  │
│                                                    │
│  VITE_SUPABASE_ANON_KEY                            │
│  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Edit Dialog:

```
┌────────────────────────────────────────────┐
│  Edit Environment Variable                 │
├────────────────────────────────────────────┤
│                                            │
│  Name: VITE_API_URL                        │
│                                            │
│  Value:                                    │
│  [https://accounting-software-production.up.railway.app]
│                                            │
│  Environment: [Production] ✓               │
│                                            │
│  [Cancel]  [Save]                          │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🔍 After Redeployment

### Step 1: Wait for "Ready" Status

In Vercel Deployments tab:
- Latest deployment should show ✅ "Ready"
- Usually takes 1-2 minutes

### Step 2: Test Your Production App

**Open this URL:**
```
https://frontend-eight-eosin-75.vercel.app
```

**Try these:**
1. ✅ Page loads (not blank)
2. ✅ Login page appears
3. ✅ Login with: testuser3@gmail.com
4. ✅ Dashboard shows with data
5. ✅ Transactions page works
6. ✅ Reports generate successfully
7. ✅ Invoices page loads (Phase 7 feature)

---

## 🐛 Troubleshooting

### Can't Find VITE_API_URL

**Solution:**
- It might not exist yet
- Click "Add New" button in Environment Variables
- Name: `VITE_API_URL`
- Value: `https://accounting-software-production.up.railway.app`
- Environment: Production, Preview, Development (check all three)
- Save

### Variable Won't Save

**Solution:**
- Make sure you're clicking "Save" not "Cancel"
- Check there's no trailing space in the URL
- URL should be exactly: `https://accounting-software-production.up.railway.app`

### Redeploy Button Grayed Out

**Solution:**
- Try clicking "Redeploy" from project overview
- Or create a new deployment by pushing to GitHub
- Or use Vercel CLI: `vercel --prod`

### App Still Shows Old "Accounting Software" Title

**Solution:**
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Wait a few more seconds for deployment to fully complete
- Check Vercel deployment status is "Ready"

### Login Fails After Update

**Solution:**
- Open browser console (F12)
- Check for error messages
- Verify VITE_API_URL is correct (no typos)
- Test Railway backend directly:
  ```
  https://accounting-software-production.up.railway.app/health
  ```
- Should return a health check response

---

## 📊 Verification Checklist

Before closing, verify:

- [ ] VITE_API_URL = `https://accounting-software-production.up.railway.app`
- [ ] VITE_SUPABASE_URL = `https://kjaantlojwxmmaohgouc.supabase.co`
- [ ] VITE_SUPABASE_ANON_KEY = (your anon key set)
- [ ] Saved all changes
- [ ] Redeployed
- [ ] Deployment status = "Ready" ✅
- [ ] Production app loads
- [ ] Can login and use features

---

## 🎯 Quick Copy-Paste

**Railway Backend URL to use:**
```
https://accounting-software-production.up.railway.app
```

**Vercel Dashboard:**
```
https://vercel.com/dashboard
```

**Your Production App:**
```
https://frontend-eight-eosin-75.vercel.app
```

---

## 🎉 What Happens After This

Once you update Vercel and redeploy:

1. **Frontend (Vercel)** connects to → **Backend (Railway)**
2. **Backend (Railway)** connects to → **Database (Supabase)**
3. **Full stack working** in production! 🚀

Your app will be:
- ✅ Fully deployed
- ✅ Accessible worldwide
- ✅ Connected to Railway backend
- ✅ Using Supabase database
- ✅ All features working

---

**Your Next Action:** Go to https://vercel.com/dashboard and update `VITE_API_URL`! 🚀

---

*Created: January 7, 2026*
