# Quick Start: Sync Desktop to Railway

**Answer:** NO, you don't need a second Railway account! ✅

Use your existing Railway account from the laptop on this desktop PC.

---

## 🎯 What You Need to Do (4 Simple Steps)

### Step 1: Login to Railway (Same Account)
```bash
railway login
```
- This opens your browser
- Login with the SAME credentials you used on laptop
- Authorize the desktop CLI

### Step 2: Navigate to Backend and Link Project
```bash
cd backend
railway link
```
- Select your existing accounting backend project from the list
- This connects your desktop to the deployed backend

### Step 3: Deploy Your Updated Code

**Option A: Via GitHub (Recommended)**
```bash
# Go back to root
cd ..

# Push to GitHub
git push origin master
```
Railway will auto-deploy if connected to GitHub.

**Option B: Direct Deploy**
```bash
# From backend folder
cd backend
railway up
```

### Step 4: Get Backend URL and Update Vercel
```bash
railway domain
```

Copy the URL (e.g., `https://accounting-backend.railway.app`)

Then update Vercel:
1. Go to https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Update `VITE_API_URL` with Railway URL
4. Redeploy

---

## ✅ That's It!

Your desktop is now synced with:
- ✅ Same Railway account (no second account needed)
- ✅ Same backend deployment
- ✅ Same Supabase database
- ✅ Same GitHub repository

Everything connected! 🎉

---

## 📚 Detailed Guide

See [RAILWAY_SYNC_GUIDE.md](RAILWAY_SYNC_GUIDE.md) for:
- Troubleshooting
- Alternative methods
- Complete command reference
- Security notes

---

## 🚀 One-Line Deploy

After Railway is linked:
```bash
git push origin master && railway up
```

---

**Created:** January 7, 2026
