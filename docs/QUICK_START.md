# Quick Start Guide

Get your accounting software up and running in minutes!

## Prerequisites

- Node.js 20+ and npm
- Git
- Supabase account (free tier available)
- API keys for integrations (can be added later)

## 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourorg/accounting-software.git
cd accounting-software

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install all dependencies for backend and frontend
- Create `.env` files from templates
- Set up the project structure

## 2. Configure Supabase

### Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for provisioning (2-3 minutes)

### Run Database Migrations

1. In Supabase dashboard, go to "SQL Editor"
2. Create a new query
3. Copy and paste contents of `database/migrations/001_initial_schema.sql`
4. Click "Run"

### Get Credentials

1. Go to Project Settings > API
2. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

### Update Environment Files

**Backend (.env):**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

## 4. Create Your First Account

1. Open browser to `http://localhost:5173`
2. Click "Register"
3. Enter email and password
4. Login with credentials

## 5. Create Organization

After login, you'll need to create your first organization:

```sql
-- Run in Supabase SQL Editor
-- Replace USER_EMAIL with your registered email

-- Get user ID
SELECT id FROM auth.users WHERE email = 'USER_EMAIL';

-- Create organization
INSERT INTO organizations (name, abn)
VALUES ('My Business', '12345678901')
RETURNING id;

-- Link user to organization (replace UUIDs)
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'USER_UUID',
  'ORG_UUID',
  'owner'
);
```

## 6. Seed Chart of Accounts

```sql
-- Run in Supabase SQL Editor
-- Replace {{organization_id}} with your organization UUID in:
-- database/seeds/chart_of_accounts.sql

-- Then execute the file contents
```

## 7. Test the Application

### Create a Transaction

1. Navigate to Transactions page
2. Click "New Transaction"
3. Fill in details:
   - Date: Today's date
   - Amount: 100.00
   - Type: Debit
   - Category: Office Expenses
   - Description: Test transaction
4. Click "Save"

### View Reports

1. Navigate to Reports page
2. Select date range (e.g., this month)
3. View:
   - Profit & Loss
   - Cashflow
   - Balance Sheet

## 8. Configure Integrations (Optional)

### Monoova (Payments)

1. Sign up at https://monoova.com
2. Get API key from dashboard
3. Add to `backend/.env`:
   ```env
   MONOOVA_API_KEY=your_key_here
   MONOOVA_BASE_URL=https://api.monoova.com
   ```

### Basiq (Bank Feeds)

1. Sign up at https://basiq.io
2. Get API key
3. Add to `backend/.env`:
   ```env
   BASIQ_API_KEY=your_key_here
   ```

### LodgeIT (Tax Lodgement)

1. Sign up at https://lodgeit.net.au
2. Get API credentials
3. Add to `backend/.env`:
   ```env
   LODGEIT_API_KEY=your_key_here
   LODGEIT_CLIENT_ID=your_client_id
   ```

## 9. Test Bubble Integration (Optional)

If using Bubble.io as frontend:

1. Create new Bubble app
2. Install API Connector plugin
3. Configure API:
   - Base URL: `http://localhost:3001`
   - Authentication: Bearer token
4. Add endpoints from `docs/API.md`

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests
npm run lint        # Lint code

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests

# Docker
docker-compose up -d         # Start all services
docker-compose logs -f       # View logs
docker-compose down          # Stop all services
```

## Troubleshooting

### "Cannot connect to database"
- Check Supabase URL and keys in `.env`
- Verify Supabase project is running
- Check network connectivity

### "Port already in use"
- Backend (3001): Check if another process is using port 3001
- Frontend (5173): Check if another Vite dev server is running
- Change ports in configuration files if needed

### "CORS errors"
- Ensure backend CORS is configured for `http://localhost:5173`
- Check `backend/src/server.ts` CORS settings

### "Migrations failed"
- Check SQL syntax in migration files
- Verify Supabase connection
- Run migrations one at a time

## Next Steps

1. **Customize:**
   - Modify chart of accounts for your business
   - Add custom categories
   - Configure tax settings

2. **Integrate:**
   - Connect bank feeds via Basiq
   - Set up payment gateway with Monoova
   - Configure tax lodgement with LodgeIT

3. **Deploy:**
   - Follow `docs/DEPLOYMENT.md` for production deployment
   - Set up CI/CD pipelines
   - Configure monitoring

4. **Develop:**
   - Add custom features
   - Modify UI components
   - Extend API endpoints

## Resources

- **Full Documentation:** See `README.md`
- **API Reference:** See `docs/API.md`
- **Deployment Guide:** See `docs/DEPLOYMENT.md`
- **Architecture:** See `accounting-software-architecture.md`

## Support

Need help?
- GitHub Issues: https://github.com/yourorg/accounting-software/issues
- Email: support@yourapp.com
- Documentation: https://docs.yourapp.com

---

You're all set! Start building your accounting workflow.
