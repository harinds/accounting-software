# Account Assignment Script

This script automatically assigns chart of accounts to transactions based on their category field.

## What it does

The script matches transaction categories to appropriate account codes:

### Revenue Categories (for credit transactions)
- Sales → 4000 (Sales Revenue)
- Services, Subscriptions, Training, Support, Development, etc. → 4020 (Service Revenue)
- Consulting → 4020 (Service Revenue)
- Projects → 4020 (Service Revenue)

### Expense Categories (for debit transactions)
- Payroll → 6910 (Salaries)
- Rent → 6810 (Rent)
- Utilities → 6820 (Utilities)
- Hosting → 6300 (Computer & IT Expenses)
- Software → 6310 (Software Subscriptions)
- Marketing → 6000 (Advertising & Marketing)
- And many more...

## How to run

### Option 1: Using Node.js (Recommended)

```bash
node scripts/assign-accounts.js
```

### Option 2: Using PowerShell (Windows)

```powershell
.\scripts\assign-accounts.ps1
```

### Option 3: Using Bash (Linux/Mac)

```bash
chmod +x scripts/assign-accounts.sh
./scripts/assign-accounts.sh
```

## What to expect

The script will:
1. Connect to your Supabase database
2. Find all transactions without an account_id
3. Match each transaction's category to the appropriate account code
4. Update the transaction with the account_id
5. Show a summary of results

Example output:
```
🔍 Starting account assignment process...

📊 Using organization: My Company

📝 Found 58 transactions without accounts

✅ Assigned "Sales" → Account 4000
✅ Assigned "Services" → Account 4020
✅ Assigned "Payroll" → Account 6910
...

============================================================
📊 SUMMARY
============================================================
✅ Successfully assigned: 58
❌ Failed: 0
⚠️  Skipped: 0
📝 Total processed: 58
============================================================

🎉 Account assignment completed! Your P&L report should now show data.
```

## After running

Once the script completes successfully:
1. Go to the Reports page
2. Select "Profit & Loss" report
3. Set date range to October 1, 2024 - December 31, 2024
4. Click "Generate Report"
5. You should now see revenue and expense data grouped by account!
