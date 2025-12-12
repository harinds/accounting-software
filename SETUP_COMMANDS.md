# Complete Setup Commands & Steps

This document contains **all commands and steps** needed to set up and run the accounting software.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Docker Deployment](#docker-deployment)
7. [Production Deployment](#production-deployment)

---

## Initial Setup

### Prerequisites Installation

**Install Node.js 20+:**
```bash
# Windows (using Chocolatey)
choco install nodejs-lts

# macOS (using Homebrew)
brew install node@20

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

**Install Git:**
```bash
# Windows
choco install git

# macOS
brew install git

# Linux
sudo apt-get install git

# Verify
git --version
```

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourorg/accounting-software.git

# Navigate to project directory
cd accounting-software

# Check structure
ls -la
```

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Enter details:
   - **Name:** accounting-software
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

### 2. Run Database Migrations

**Option A: Using Supabase Dashboard**

1. In Supabase dashboard, click "SQL Editor" in sidebar
2. Click "New Query"
3. Copy entire contents of `database/migrations/001_initial_schema.sql`
4. Paste into SQL editor
5. Click "Run" or press Ctrl+Enter
6. Verify success message

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 3. Get API Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Backend Setup

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# This will install:
# - Express, TypeScript, Zod
# - Supabase client
# - Axios for API calls
# - Winston for logging
# - And more...
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Complete .env configuration:**

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Monoova Payment Gateway (optional - get from https://monoova.com)
MONOOVA_API_KEY=your_monoova_api_key
MONOOVA_BASE_URL=https://api.monoova.com
MONOOVA_WEBHOOK_SECRET=your_webhook_secret

# Basiq CDR Provider (optional - get from https://basiq.io)
BASIQ_API_KEY=your_basiq_api_key
BASIQ_BASE_URL=https://au-api.basiq.io

# LodgeIT Tax Service (optional - get from https://lodgeit.net.au)
LODGEIT_API_KEY=your_lodgeit_api_key
LODGEIT_BASE_URL=https://api.lodgeit.net.au
LODGEIT_CLIENT_ID=your_client_id

# Security (generate random strings)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Redis (for job queues - optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Verify Backend

```bash
# Type check
npm run build

# Run linter
npm run lint

# Expected output: No errors
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install all dependencies
npm install

# This will install:
# - React 18, React Router
# - TanStack Query
# - Zustand for state
# - TailwindCSS
# - And more...
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Complete .env configuration:**

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Add Missing Files

Create `tailwind.config.js`:

```bash
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
```

Create `postcss.config.js`:

```bash
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

Create `tsconfig.node.json`:

```bash
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

Create `index.html`:

```bash
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Accounting Software</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

### 4. Verify Frontend

```bash
# Type check
npm run type-check

# Build test
npm run build

# Expected output: Build successful
```

---

## Running the Application

### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd backend

# Start development server with hot reload
npm run dev

# Expected output:
# Server running on port 3001 in development mode
# HTTP Request logging enabled
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend

# Start Vite development server
npm run dev

# Expected output:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Access the Application

1. Open browser to `http://localhost:5173`
2. You should see the login page
3. Backend API available at `http://localhost:3001`

### Create First User

**Option A: Via Frontend UI**

1. Click "Register" on login page
2. Enter:
   - Email: `admin@example.com`
   - Password: `securepassword123`
   - Full Name: `Admin User`
3. Click "Register"
4. Login with same credentials

**Option B: Via Supabase Dashboard**

1. Go to **Authentication** > **Users**
2. Click "Add User"
3. Enter email and password
4. Click "Send Magic Link" (optional)

### Create Organization

Run in Supabase SQL Editor:

```sql
-- Step 1: Get your user ID
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
-- Copy the ID (UUID)

-- Step 2: Create organization
INSERT INTO organizations (name, abn, tfn)
VALUES ('My Business', '12345678901', '123456789')
RETURNING id;
-- Copy the organization ID (UUID)

-- Step 3: Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_UUID_HERE',
  'ORG_UUID_HERE',
  'owner'
);

-- Verify
SELECT
  u.email,
  o.name as organization,
  uo.role
FROM user_organizations uo
JOIN users u ON uo.user_id = u.id
JOIN organizations o ON uo.organization_id = o.id;
```

### Seed Chart of Accounts

1. Open `database/seeds/chart_of_accounts.sql`
2. Replace all `{{organization_id}}` with your organization UUID
3. Run in Supabase SQL Editor

Or use this script:

```bash
# Replace YOUR_ORG_UUID with actual UUID
ORG_UUID="YOUR_ORG_UUID"

sed "s/{{organization_id}}/$ORG_UUID/g" database/seeds/chart_of_accounts.sql > /tmp/seed.sql

# Then run /tmp/seed.sql in Supabase SQL Editor
```

---

## Docker Deployment

### 1. Install Docker

```bash
# Windows: Download from https://docker.com
# macOS:
brew install --cask docker

# Linux (Ubuntu):
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Verify
docker --version
docker-compose --version
```

### 2. Create Environment File

```bash
# In project root, create .env
cat > .env << 'EOF'
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
MONOOVA_API_KEY=your_key
MONOOVA_BASE_URL=https://api.monoova.com
BASIQ_API_KEY=your_key
LODGEIT_API_KEY=your_key
JWT_SECRET=your_secret
EOF
```

### 3. Build and Run

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Expected output:
# accounting-backend    running    0.0.0.0:3001->3001/tcp
# accounting-frontend   running    0.0.0.0:80->80/tcp
# accounting-redis      running    0.0.0.0:6379->6379/tcp
```

### 4. Access Dockerized App

- Frontend: `http://localhost`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

### 5. Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Production Deployment

### Railway (Backend)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://xxx.supabase.co
# ... add all other variables

# Deploy
railway up

# Get URL
railway domain
```

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: accounting-software
# - Directory: ./
# - Override settings? N

# Deploy to production
vercel --prod

# Add environment variables in Vercel dashboard:
# Settings > Environment Variables
```

### Configure Webhooks

After deployment, configure webhooks:

**Monoova:**
- Webhook URL: `https://your-backend.railway.app/api/webhooks/monoova`

**Basiq:**
- Webhook URL: `https://your-backend.railway.app/api/webhooks/basiq`

**LodgeIT:**
- Webhook URL: `https://your-backend.railway.app/api/webhooks/lodgeit`

---

## Testing the Application

### Manual Testing

```bash
# Test backend health
curl http://localhost:3001/health

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Run Tests

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

---

## Troubleshooting Commands

### Check Ports

```bash
# Linux/macOS
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### Clear Node Modules

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### View Logs

```bash
# Backend logs
cd backend
tail -f logs/combined.log
tail -f logs/error.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Reset Database

```sql
-- Run in Supabase SQL Editor
-- WARNING: This deletes all data!

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS tax_returns CASCADE;
DROP TABLE IF EXISTS bank_feeds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run migrations
```

---

## Summary Checklist

- [ ] Node.js 20+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Supabase project created
- [ ] Database migrations run
- [ ] API credentials copied
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on :3001
- [ ] Frontend running on :5173
- [ ] User account created
- [ ] Organization created
- [ ] User linked to organization
- [ ] Chart of accounts seeded
- [ ] Test transaction created
- [ ] Reports loading correctly

---

**Your accounting software is now fully set up and running!**

For more information, see:
- `README.md` - Project overview
- `docs/QUICK_START.md` - Quick start guide
- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
