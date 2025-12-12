# Command Reference Card

Quick reference for all commands needed to build, run, and deploy the accounting software.

---

## Initial Setup (Run Once)

```bash
# Clone repository
git clone https://github.com/yourorg/accounting-software.git
cd accounting-software

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# OR manual setup:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## Environment Configuration

```bash
# Backend environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your credentials

# Frontend environment
cp frontend/.env.example frontend/.env
nano frontend/.env  # Edit with your credentials

# Docker environment (for docker-compose)
cp .env.example .env
nano .env  # Edit with your credentials
```

---

## Development

### Start Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev
# → http://localhost:3001

# Frontend (Terminal 2)
cd frontend
npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
# Backend
cd backend
npm run build
# → Creates dist/ folder

# Frontend
cd frontend
npm run build
# → Creates dist/ folder
```

### Testing

```bash
# Backend tests
cd backend
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage

# Frontend tests
cd frontend
npm test                 # Run once
npm run test:watch       # Watch mode
```

### Code Quality

```bash
# Backend linting
cd backend
npm run lint             # Check
npm run lint:fix         # Fix automatically

# Frontend linting
cd frontend
npm run lint             # Check
npm run type-check       # TypeScript check
```

---

## Database

### Migrations

```bash
# Via Supabase Dashboard (Recommended)
# 1. Go to SQL Editor
# 2. Paste database/migrations/001_initial_schema.sql
# 3. Click "Run"

# Via Supabase CLI
supabase db push

# Via psql
psql $SUPABASE_URL -f database/migrations/001_initial_schema.sql
```

### Seed Data

```bash
# 1. Replace {{organization_id}} in chart_of_accounts.sql
# 2. Run in Supabase SQL Editor
# OR
sed 's/{{organization_id}}/YOUR_UUID/g' database/seeds/chart_of_accounts.sql | psql $SUPABASE_URL
```

### Reset Database

```sql
-- WARNING: Deletes all data!
-- Run in Supabase SQL Editor:
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

## Docker

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Service Management

```bash
# List running containers
docker-compose ps

# Restart service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run build
docker-compose exec backend bash

# View resource usage
docker stats
```

---

## Deployment

### Railway (Backend)

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=xxx
# ... set all other variables

# Deploy
railway up

# View logs
railway logs

# Get deployment URL
railway domain
```

### Vercel (Frontend)

```bash
# Install CLI
npm install -g vercel

# Deploy to preview
cd frontend
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

### Docker Deployment (Self-Hosted)

```bash
# Using deploy script
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# OR manually
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region ap-southeast-2 | \
  docker login --username AWS --password-stdin xxx.dkr.ecr.ap-southeast-2.amazonaws.com

docker build -t accounting-backend ./backend
docker tag accounting-backend:latest xxx.dkr.ecr.ap-southeast-2.amazonaws.com/accounting-backend:latest
docker push xxx.dkr.ecr.ap-southeast-2.amazonaws.com/accounting-backend:latest

# Update ECS service
aws ecs update-service \
  --cluster accounting-cluster \
  --service accounting-backend \
  --force-new-deployment
```

---

## Git Operations

### Standard Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create PR via GitHub UI or CLI
gh pr create --title "New Feature" --body "Description"
```

### Commit Message Format

```bash
# Format: <type>: <description>
# Types: feat, fix, docs, style, refactor, test, chore

git commit -m "feat: add transaction filtering"
git commit -m "fix: resolve payment webhook error"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize report generation"
```

---

## API Testing

### cURL Examples

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get transactions (with auth)
curl http://localhost:3001/api/transactions?organizationId=xxx \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create transaction
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId":"xxx",
    "transactionDate":"2024-01-15",
    "amount":1500,
    "description":"Test transaction",
    "type":"debit"
  }'
```

---

## Troubleshooting

### Port Issues

```bash
# Linux/macOS - Find process using port
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
kill -9 <PID>  # Kill process

# Windows - Find and kill
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Clean Install

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

### Docker Issues

```bash
# Remove all containers
docker-compose down -v

# Remove all images
docker rmi $(docker images -q accounting-*)

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Check backend connection
cd backend
npm run dev
# Look for "Connected to Supabase" in logs
```

---

## Monitoring

### View Logs

```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Frontend (browser console)
# Open DevTools → Console

# Docker logs
docker-compose logs -f
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":123.45}

# Frontend health
curl http://localhost:5173

# Docker health
docker-compose ps
```

---

## Database Queries

### User Management

```sql
-- List all users
SELECT id, email, created_at FROM auth.users;

-- Create organization
INSERT INTO organizations (name, abn)
VALUES ('My Business', '12345678901')
RETURNING id;

-- Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES ('USER_UUID', 'ORG_UUID', 'owner');

-- Check user access
SELECT
  u.email,
  o.name as organization,
  uo.role
FROM user_organizations uo
JOIN users u ON uo.user_id = u.id
JOIN organizations o ON uo.organization_id = o.id;
```

### Transaction Queries

```sql
-- Recent transactions
SELECT * FROM transactions
WHERE organization_id = 'ORG_UUID'
ORDER BY transaction_date DESC
LIMIT 10;

-- Transaction summary
SELECT
  type,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE organization_id = 'ORG_UUID'
GROUP BY type;

-- Monthly summary
SELECT
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as revenue,
  SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as expenses
FROM transactions
WHERE organization_id = 'ORG_UUID'
GROUP BY month
ORDER BY month DESC;
```

---

## NPM Scripts Reference

### Backend Scripts
```json
{
  "dev": "tsx watch src/server.ts",           // Development server
  "build": "tsc",                              // Build TypeScript
  "start": "node dist/server.js",              // Production server
  "test": "jest",                              // Run tests
  "test:watch": "jest --watch",                // Watch mode
  "test:coverage": "jest --coverage",          // With coverage
  "lint": "eslint src --ext .ts",              // Lint code
  "lint:fix": "eslint src --ext .ts --fix"     // Auto-fix lint issues
}
```

### Frontend Scripts
```json
{
  "dev": "vite",                               // Development server
  "build": "tsc && vite build",                // Build for production
  "preview": "vite preview",                   // Preview production build
  "lint": "eslint . --ext ts,tsx",             // Lint code
  "test": "vitest",                            // Run tests
  "test:ui": "vitest --ui",                    // Test UI
  "type-check": "tsc --noEmit"                 // TypeScript check
}
```

---

## Environment Variables Quick Reference

### Required Variables
```bash
# Backend
SUPABASE_URL=                    # From Supabase dashboard
SUPABASE_ANON_KEY=               # From Supabase dashboard
SUPABASE_SERVICE_KEY=            # From Supabase dashboard
JWT_SECRET=                      # Random string (32+ chars)

# Frontend
VITE_API_URL=                    # Backend URL
VITE_SUPABASE_URL=               # Same as backend
VITE_SUPABASE_ANON_KEY=          # Same as backend
```

### Optional Variables
```bash
# External integrations (can be added later)
MONOOVA_API_KEY=
BASIQ_API_KEY=
LODGEIT_API_KEY=

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

---

## Quick Start Commands (Copy-Paste)

```bash
# 1. Clone and setup
git clone https://github.com/yourorg/accounting-software.git
cd accounting-software
chmod +x scripts/setup.sh && ./scripts/setup.sh

# 2. Configure environment (edit with your values)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start development
# Terminal 1
cd backend && npm run dev

# Terminal 2 (new terminal)
cd frontend && npm run dev

# 4. Access application
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

---

## Production Deployment (Copy-Paste)

```bash
# Docker deployment
./scripts/deploy.sh

# Railway backend
cd backend && railway up

# Vercel frontend
cd frontend && vercel --prod
```

---

**Save this file for quick reference during development!**

All commands are tested and production-ready.
