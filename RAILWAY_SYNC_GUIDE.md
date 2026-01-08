# Railway Sync Guide - Desktop to Existing Deployment

**Date:** January 7, 2026
**Purpose:** Connect desktop to existing Railway backend deployment from laptop

---

## ✅ Good News: Use Your Existing Railway Account!

You **DO NOT** need a second Railway account. Railway is account-based, not machine-based.

### Your Current Setup:
- **Laptop:** Already deployed backend to Railway
- **Desktop:** This PC (new machine)
- **Same Account:** You'll use the same Railway account

### How It Works:
1. Install Railway CLI on desktop
2. Login with same credentials (from laptop)
3. Link to existing project
4. Push updated code from desktop
5. Railway auto-deploys the updates

---

## 🚀 Step-by-Step Instructions

### Step 1: Install Railway CLI on Desktop

```bash
npm install -g @railway/cli
```

Wait for installation to complete, then verify:
```bash
railway --version
```

### Step 2: Login to Railway (Same Account)

```bash
railway login
```

This will:
1. Open browser for authentication
2. Use the SAME account you created on laptop
3. Store credentials locally on desktop

### Step 3: Navigate to Backend Directory

```bash
cd backend
```

### Step 4: Link to Existing Railway Project

**Option A: Interactive Selection (Recommended)**
```bash
railway link
```
- Select your existing project from the list
- Choose the backend service/environment

**Option B: Manual Link (if you know project ID)**
```bash
railway link <project-id>
```

### Step 5: Verify Connection

```bash
railway status
```

This should show:
- Connected project name
- Current environment
- Service details

### Step 6: Push Your Updated Code

Since you've already committed changes on desktop:

```bash
# Make sure you're in backend directory
cd backend

# Push to Railway (this will trigger deployment)
railway up
```

OR if you want Railway to deploy from GitHub:
```bash
# First push to GitHub
cd ..
git push origin master

# Railway will auto-deploy if connected to GitHub
```

### Step 7: Get Backend URL

```bash
railway domain
```

Or view in Railway dashboard:
- Go to https://railway.app/dashboard
- Click your project
- Copy the deployment URL (e.g., `https://your-app.railway.app`)

### Step 8: Update Vercel Frontend Environment

1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Update `VITE_API_URL` with Railway backend URL
5. Redeploy frontend

---

## 🔄 Alternative: GitHub Auto-Deploy

If your Railway project is connected to GitHub (which is common):

### Step 1: Just Push to GitHub
```bash
git push origin master
```

### Step 2: Railway Auto-Deploys
- Railway watches your GitHub repo
- Detects changes in `/backend` folder
- Automatically builds and deploys
- No need for `railway up` command

### How to Check:
1. Go to https://railway.app/dashboard
2. Click your project
3. Check "Settings" → "GitHub Repo"
4. If connected, it will show: `harinds/accounting-software`

---

## 📋 Quick Commands Reference

### Installation:
```bash
npm install -g @railway/cli
```

### Login (same account as laptop):
```bash
railway login
```

### Link to existing project:
```bash
cd backend
railway link
```

### Deploy from desktop:
```bash
railway up
```

### View logs:
```bash
railway logs
```

### View environment variables:
```bash
railway variables
```

### Get deployment URL:
```bash
railway domain
```

### Open Railway dashboard:
```bash
railway open
```

---

## 🔍 Finding Your Railway Project Info

### From Laptop (if accessible):
1. Go to Railway dashboard on laptop
2. Copy project name and ID
3. Note backend deployment URL

### From Railway Dashboard (any device):
1. Go to https://railway.app
2. Login with same credentials
3. View "Projects" - you should see your accounting backend
4. Click it to see all details

### From GitHub (if auto-deploy is set up):
1. Check your repo settings
2. Look for Railway integration
3. Railway webhook should be listed

---

## ⚙️ Environment Variables

Your Railway backend should already have these variables (set from laptop):

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://kjaantlojwxmmaohgouc.supabase.co
SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_KEY=<your-key>
JWT_SECRET=<your-secret>
ENCRYPTION_KEY=<your-encryption-key>
FRONTEND_URL=https://frontend-eight-eosin-75.vercel.app
```

### To verify/update variables from desktop:
```bash
cd backend
railway variables
```

### To add/change a variable:
```bash
railway variables set VARIABLE_NAME=value
```

---

## 🎯 Complete Sync Workflow

### Full Process from Desktop:

1. **Commit your desktop changes** (already done!):
   ```bash
   git status  # verify commit
   ```

2. **Push to GitHub**:
   ```bash
   git push origin master
   ```

3. **If Railway is GitHub-connected**:
   - Done! Railway auto-deploys
   - Check deployment: https://railway.app/dashboard

4. **If Railway needs manual deploy**:
   ```bash
   npm install -g @railway/cli
   railway login
   cd backend
   railway link
   railway up
   ```

5. **Get backend URL**:
   ```bash
   railway domain
   ```

6. **Update Vercel**:
   - Dashboard → Settings → Environment Variables
   - Set `VITE_API_URL` to Railway URL
   - Redeploy

7. **Test production**:
   - Visit: https://frontend-eight-eosin-75.vercel.app
   - Login and test features

---

## 🐛 Troubleshooting

### Issue: "railway: command not found"
**Solution:**
```bash
npm install -g @railway/cli
# Restart terminal
railway --version
```

### Issue: "No projects found"
**Solution:**
- Make sure you're logged in: `railway login`
- Use the SAME credentials as laptop
- Check Railway dashboard to verify project exists

### Issue: "Failed to link project"
**Solution:**
```bash
# Try manual link
railway link <project-id>

# Or unlink and relink
railway unlink
railway link
```

### Issue: Can't find project ID
**Solution:**
1. Go to https://railway.app/dashboard
2. Click your project
3. URL will show project ID: `railway.app/project/<project-id>`

### Issue: Railway deploys old code
**Solution:**
```bash
# Make sure changes are committed
git status

# Push to GitHub first
git push origin master

# Then redeploy
railway up --detach
```

---

## 📊 Deployment Status Check

After deploying, verify:

### 1. Railway Backend:
```bash
railway logs
```
Should show:
- "Server running on port 3001"
- No errors
- Supabase connected

### 2. Test Backend API:
```bash
curl https://your-app.railway.app/health
```
Should return health status.

### 3. Vercel Frontend:
- Visit: https://frontend-eight-eosin-75.vercel.app
- Should load login page
- Should connect to Railway backend

### 4. Full Integration Test:
1. Login with testuser3@gmail.com
2. Create a test transaction
3. View reports
4. Check invoice features

---

## ✅ Success Checklist

- [ ] Railway CLI installed on desktop
- [ ] Logged into Railway (same account as laptop)
- [ ] Linked to existing backend project
- [ ] Desktop code pushed to GitHub
- [ ] Railway deployment successful
- [ ] Backend URL obtained
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed on Vercel
- [ ] Production app works end-to-end

---

## 🔐 Security Notes

### Same Account = Shared Access:
- Desktop and laptop share Railway account
- Both can deploy to same project
- Both can view logs and variables
- **This is NORMAL and recommended**

### Best Practices:
1. Always commit before deploying
2. Test locally first (http://localhost:5173)
3. Check Railway logs after deployment
4. Verify Supabase connection
5. Test production after deployment

---

## 💡 Pro Tips

### 1. GitHub Auto-Deploy (Recommended):
- Set up once from Railway dashboard
- Connect to GitHub repo
- Automatic deployments on push
- No need for `railway up` command

### 2. Environment Sync:
```bash
# Pull variables to local .env
railway variables > .env.railway
```

### 3. Quick Deployment:
```bash
# One command deploy
git push origin master && railway up
```

### 4. Watch Logs:
```bash
# Follow logs in real-time
railway logs -f
```

---

## 📞 Next Steps

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login** (same account):
   ```bash
   railway login
   ```

3. **Check existing deployment**:
   - Go to https://railway.app/dashboard
   - Verify your backend project exists
   - Note the deployment URL

4. **Link and deploy**:
   ```bash
   cd backend
   railway link
   railway up
   ```

5. **Update Vercel** with Railway URL

6. **Test production app**

---

**Status:** Ready to sync! 🚀

Use your existing Railway account. No need for a second one.

---

*Created: January 7, 2026*
