# Setup Instructions

This guide will help you get the accounting software running locally.

## Phase 1 Completion Status ✅

- [x] Backend .env file created with secure keys
- [x] Frontend .env file created
- [x] Backend dependencies installed
- [x] Frontend dependencies installed

## Next Steps: Configure Supabase

Before you can run the application, you need to set up Supabase:

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: accounting-software (or your preferred name)
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
5. Wait for project to be created (takes 1-2 minutes)

### 2. Get Supabase Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL**: Copy this (e.g., `https://abcdefghijk.supabase.co`)
   - **anon public key**: Copy this (starts with `eyJ...`)
   - **service_role key**: Copy this (starts with `eyJ...`) - **Keep this secret!**

### 3. Update Environment Files

Update both `.env` files with your Supabase credentials:

**backend/.env:**
```bash
SUPABASE_URL=https://your-actual-project-url.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here
```

**frontend/.env:**
```bash
VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 4. Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor** (in sidebar)
2. Click **New Query**
3. Copy the contents of `database/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success" message
7. Repeat for `database/seeds/chart_of_accounts.sql`

### 5. Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - users
   - organizations
   - user_organizations
   - accounts
   - transactions
   - invoices
   - payments
   - bank_feeds
   - tax_returns
   - audit_logs

## Running the Application

Once Supabase is configured:

### Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3001 in development mode
```

### Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.1.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and go to: [http://localhost:5173](http://localhost:5173)

You should see the login page!

## Troubleshooting

### Backend won't start

**Problem:** "Cannot find module" errors
- **Solution:** Run `npm install` in the backend directory

**Problem:** Supabase connection errors
- **Solution:** Double-check your .env file has correct Supabase credentials
- Make sure there are no extra spaces in the .env values

### Frontend won't start

**Problem:** "Cannot find module" errors
- **Solution:** Run `npm install` in the frontend directory

**Problem:** API connection errors
- **Solution:** Make sure backend is running on port 3001
- Check VITE_API_URL in frontend/.env is set to `http://localhost:3001`

### Database migration fails

**Problem:** Permission errors when running SQL
- **Solution:** Make sure you're logged into Supabase dashboard
- Try running each table creation statement separately

**Problem:** "relation already exists" errors
- **Solution:** This means the tables are already created - you can skip this step

## Optional: External API Credentials

For full functionality, you'll eventually need API credentials for:

### Monoova (Payment Processing)
- Sign up at [https://monoova.com](https://monoova.com)
- Request sandbox/test credentials
- Update `MONOOVA_API_KEY` in backend/.env

### Basiq (Bank Feeds)
- Sign up at [https://dashboard.basiq.io](https://dashboard.basiq.io)
- Create an application to get API key
- Update `BASIQ_API_KEY` in backend/.env

### LodgeIT (Tax Lodgement)
- Contact LodgeIT for sandbox access
- Update `LODGEIT_API_KEY` and `LODGEIT_CLIENT_ID` in backend/.env

**Note:** The application will work without these for now - these features just won't be functional until you add the credentials.

## What's Next?

Now that your environment is set up, the next phase is implementing authentication. Check `IMPLEMENTATION_PLAN.md` for the full roadmap.

### Immediate Next Steps (Phase 2):
1. Implement backend auth routes
2. Build login and registration pages
3. Set up protected routes

See `IMPLEMENTATION_PLAN.md` Phase 2 for details.

## Need Help?

- Check `README.md` for project overview
- Review `docs/API.md` for API documentation
- See `IMPLEMENTATION_PLAN.md` for full implementation roadmap
- Check GitHub issues for known problems
