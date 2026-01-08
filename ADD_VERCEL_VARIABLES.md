# Add Environment Variables to Vercel

**You're in the right place!** ✅

The screen shows "No Environment Variables Added" - this means we need to **add** them (not edit existing ones).

---

## 🎯 Step-by-Step Instructions

### Step 1: Add VITE_API_URL

Look at the form you're seeing. There are two input fields:

**Key Field (on the left):**
```
1_TEST_KEY...
```
Type: `VITE_API_URL`

**Value Field (on the right):**
```
(empty)
```
Type: `https://accounting-software-production.up.railway.app`

**Then click the "Save" button (bottom right, black button).**

---

### Step 2: Add VITE_SUPABASE_URL

After saving the first variable, click **"Add Another"** button.

**Key:**
```
VITE_SUPABASE_URL
```

**Value:**
```
https://kjaantlojwxmmaohgouc.supabase.co
```

**Click "Save"**

---

### Step 3: Add VITE_SUPABASE_ANON_KEY

Click **"Add Another"** again.

**Key:**
```
VITE_SUPABASE_ANON_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A
```

**Click "Save"**

---

## 📋 All Three Variables You Need

### Variable 1: Backend URL
- **Key:** `VITE_API_URL`
- **Value:** `https://accounting-software-production.up.railway.app`

### Variable 2: Supabase URL
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://kjaantlojwxmmaohgouc.supabase.co`

### Variable 3: Supabase Anon Key
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A`

---

## 🖼️ What You Should See

### Before Adding Variables:
```
┌────────────────────────────────────────────┐
│  No Environment Variables Added            │
│                                            │
│  Add Environment Variables to Production,  │
│  Preview, and Development environments...  │
└────────────────────────────────────────────┘
```

### The Form (Top of Page):
```
┌────────────────────────────────────────────┐
│  Key                    Value              │
├────────────────────────────────────────────┤
│  [1_TEST_KEY...]        [            ]     │
│                                            │
│  [⊕ Add Another]                  [Save]  │
└────────────────────────────────────────────┘
```

### After Adding All Variables:
```
┌────────────────────────────────────────────┐
│  Environment Variables                     │
├────────────────────────────────────────────┤
│  VITE_API_URL                             │
│  https://accounting-software-production... │
│                                            │
│  VITE_SUPABASE_URL                         │
│  https://kjaantlojwxmmaohgouc.supabase.co │
│                                            │
│  VITE_SUPABASE_ANON_KEY                    │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   │
└────────────────────────────────────────────┘
```

---

## ⚙️ Environment Selection

When adding each variable, you'll see checkboxes for:
- ☑️ **Production** ← Check this one!
- ☑️ **Preview** ← Check this too (recommended)
- ☑️ **Development** ← Check this too (recommended)

**Best practice:** Check all three for each variable.

---

## ✅ After Adding All Variables

### You Should See:
1. Three environment variables listed
2. Each with Production/Preview/Development tags
3. Black "Save" button changed to saved state

### Next Step: Redeploy
1. Go to **Deployments** tab (top of page)
2. Click the **three dots (...)** on latest deployment
3. Click **"Redeploy"**
4. Wait for "Ready" status ✅

---

## 🎯 Quick Copy-Paste

**Variable 1:**
```
Key: VITE_API_URL
Value: https://accounting-software-production.up.railway.app
```

**Variable 2:**
```
Key: VITE_SUPABASE_URL
Value: https://kjaantlojwxmmaohgouc.supabase.co
```

**Variable 3:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A
```

---

## 🐛 Troubleshooting

### Can't Find Input Fields

**Look at the top of the Environment Variables page.** You should see:
- A form with "Key" and "Value" fields
- It might have placeholder text like "1_TEST_KEY..."
- Click in the Key field and replace the text

### "Save" Button is Grayed Out

**Solution:**
- Make sure you filled in both Key AND Value
- Check that Key doesn't have spaces
- Value should be the complete URL/key

### Variables Not Showing After Save

**Solution:**
- Scroll down the page
- Variables appear in a list below the form
- Page might need refresh

### Which Environments to Select?

**Recommended:**
- ✅ Production (required!)
- ✅ Preview (for testing)
- ✅ Development (for local dev)

Check all three boxes.

---

## 📊 After Adding Variables

### Verification:
1. Scroll down on Environment Variables page
2. Should see three variables listed
3. Each should show "Production, Preview, Development"

### Next Action:
1. Go to **Deployments** tab
2. Redeploy latest deployment
3. Wait for "Ready"
4. Test app!

---

**Your Next Action:** Fill in the Key/Value fields at the top of the page! 👆

Start with:
- **Key:** `VITE_API_URL`
- **Value:** `https://accounting-software-production.up.railway.app`

Then click **Save**!

---

*Created: January 7, 2026*
