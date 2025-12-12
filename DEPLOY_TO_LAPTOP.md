# Deploy to Laptop - Setup Guide

This guide will help you push your code to GitHub and set it up on your laptop.

---

## Part 1: Push to GitHub (Run on your current machine)

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `accounting-software` (or whatever you prefer)
3. Description: "Australian accounting software with Supabase, React, and Express"
4. **IMPORTANT**: Make it **Private** (contains API keys in commit history)
5. Do NOT initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

### Step 2: Add Remote and Push

After creating the repo, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/accounting-software.git

# Push to GitHub
git branch -M master
git push -u origin master
```

**Note**: If you haven't used Git with GitHub before, you might need to:
- Set up Git credentials: `git config --global user.name "Your Name"`
- Set up Git email: `git config --global user.email "your-email@example.com"`
- Authenticate with GitHub (it will prompt you)

---

## Part 2: Clone and Setup on Laptop

### Step 1: Prerequisites on Laptop

Install the following if not already installed:

1. **Node.js 20+**: https://nodejs.org/ (LTS version)
2. **Git**: https://git-scm.com/downloads
3. **Code Editor**: VS Code recommended (https://code.visualstudio.com/)

### Step 2: Clone the Repository

```bash
# Clone the repo (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/accounting-software.git
cd accounting-software
```

### Step 3: Environment Configuration

**IMPORTANT**: The `.env` files are in `.gitignore`, so you need to create them on your laptop.

#### Backend Environment

Create `backend/.env`:

```bash
# Copy the example
cp backend/.env.example backend/.env

# Or create manually with these values:
```

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (SAME as your current machine)
SUPABASE_URL=https://kjaantlojwxmmaohgouc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5ODQ0MSwiZXhwIjoyMDc2ODc0NDQxfQ.BzwFu8psCvtIIUEIokC55KZd2v5STWvzjEy8-Lx2rJY

# Monoova Payment Gateway (placeholder for now)
MONOOVA_API_KEY=your_monoova_api_key
MONOOVA_BASE_URL=https://api.demo.monoova.com
MONOOVA_WEBHOOK_SECRET=your_webhook_secret

# Basiq CDR Provider (placeholder for now)
BASIQ_API_KEY=your_basiq_api_key
BASIQ_BASE_URL=https://au-api.basiq.io

# LodgeIT Tax Service (placeholder for now)
LODGEIT_API_KEY=your_lodgeit_api_key
LODGEIT_BASE_URL=https://api.lodgeit.net.au
LODGEIT_CLIENT_ID=your_client_id

# Security - SAME keys as your current machine
JWT_SECRET=8a4f2b9e1c7d6a3b5e8f9a2c4d6e8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=3f7a9b2c4d6e8f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Frontend Environment

Create `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Supabase Configuration (SAME as backend)
VITE_SUPABASE_URL=https://kjaantlojwxmmaohgouc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWFudGxvand4bW1hb2hnb3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTg0NDEsImV4cCI6MjA3Njg3NDQ0MX0.td_WnFtUoADQSX5Iv8tv_oiADZgT9HNblR2qnVRSq_A
```

### Step 4: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 5: Run the Application

Open two terminal windows:

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

### Step 6: Access the Application

1. Open your browser to http://localhost:5173
2. Log in with your existing account (localhost.gave777@passinbox.com or harinds@gmail.com)
3. Start using the app!

---

## Important Notes

### Database
- ✅ **NO DATABASE SETUP NEEDED**: You're using the same Supabase database
- ✅ All your data, users, and organizations are already there
- ✅ Just log in with your existing credentials

### Environment Variables
- Keep the **SAME** Supabase URLs and keys on both machines
- Keep the **SAME** JWT_SECRET and ENCRYPTION_KEY on both machines
- These ensure you can work seamlessly across devices

### Development Workflow

When working on laptop:
1. Make changes
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push`

To sync back to your current machine:
1. Pull changes: `git pull`
2. Restart servers if needed

---

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:
```bash
# Find and kill the process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't Access Application
- Make sure both backend (port 3001) and frontend (port 5173) are running
- Check browser console (F12) for errors
- Check terminal logs for backend errors

---

## Security Reminders

1. ✅ Repository is **Private** (contains sensitive keys in history)
2. ⚠️ **NEVER** make the repository public
3. ⚠️ **NEVER** share your `.env` files
4. ⚠️ When going to production, regenerate ALL keys

---

## What's Already Working

- User authentication (register, login, logout)
- Transaction management (create, edit, delete)
- Organization access control
- Real-time UI updates
- Beautiful responsive design

## What's Next

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the full roadmap:
- Phase 4: Dashboard with real metrics
- Phase 5: Chart of Accounts
- Phase 6: Invoice Management
- Phase 7: Payment Integration

Happy coding! 🚀
