# Guide: Assigning Accounts to Transactions

Your transactions have been imported successfully, but they need to be linked to accounts from your Chart of Accounts for the Profit & Loss report to work.

## The Problem

The P&L report requires transactions to have an `account_id` that links them to the Chart of Accounts. Your CSV import added 58 transactions, but they don't have account assignments yet.

## Solutions

I've created **three ways** to assign accounts to your transactions:

### ⭐ Option 1: SQL Script (Fastest - Recommended)

This is the quickest method:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "+ New query"
5. Copy and paste the contents of: `database/scripts/assign-accounts-to-transactions.sql`
6. Click "Run" or press Ctrl+Enter
7. The script will show you what will be updated, then update all transactions

**This will assign accounts to all 58 transactions in seconds!**

### Option 2: Node.js Script

Run this command from the project root:

```bash
node scripts/assign-accounts.js
```

This script will:
- Connect to your database
- Find all transactions without accounts
- Match categories to appropriate account codes
- Update each transaction

### Option 3: PowerShell Script (Windows)

```powershell
.\scripts\assign-accounts.ps1
```

## What Gets Matched

The scripts use these category → account mappings:

### Revenue (Credit Transactions)
| Category | Account Code | Account Name |
|----------|--------------|--------------|
| Sales | 4000 | Sales Revenue |
| Services | 4020 | Service Revenue |
| Subscriptions | 4020 | Service Revenue |
| Training | 4020 | Service Revenue |
| Support | 4020 | Service Revenue |
| Development | 4020 | Service Revenue |
| Consulting | 4020 | Service Revenue |
| Projects | 4020 | Service Revenue |
| All other service types | 4020 | Service Revenue |

### Expenses (Debit Transactions)
| Category | Account Code | Account Name |
|----------|--------------|--------------|
| Payroll | 6910 | Salaries |
| Rent | 6810 | Rent |
| Utilities | 6820 | Utilities |
| Hosting | 6300 | Computer & IT Expenses |
| Software | 6310 | Software Subscriptions |
| Marketing | 6000 | Advertising & Marketing |
| Supplies | 6700 | Office Expenses |
| Insurance | 6400 | Insurance |
| Bank Fees | 6100 | Bank Fees & Charges |
| Contractors | 6500 | Legal & Professional Fees |
| Legal | 6520 | Legal Fees |
| Professional Services | 6510 | Accounting Fees |
| Equipment | 1550 | Computer Equipment |
| Travel | 7000 | Travel & Accommodation |
| Entertainment | 7100 | Meals & Entertainment |

## After Running

Once you've assigned accounts (using any of the methods above):

1. **Open the Reports page** in your app
2. **Click "Profit & Loss"**
3. **Set the date range**:
   - Start Date: **2024-10-01**
   - End Date: **2024-12-31**
4. **Click "Generate Report"**

You should now see:
- **Revenue section** with all your income transactions grouped by account
- **Expenses section** with all your expense transactions grouped by account
- **Net Profit** calculation
- **Profit Margin** percentage

## Expected Results

Based on your CSV data, you should see approximately:
- **Total Revenue**: ~$60,000
- **Total Expenses**: ~$15,000
- **Net Profit**: ~$45,000
- **Profit Margin**: ~75%

## Troubleshooting

### If the P&L report is still empty:

1. Check the date range - your data is from Oct-Dec 2024
2. Verify accounts were assigned:
   - Go to Transactions page
   - Look for the "Account Code" column
   - You should see codes like "4000", "6910", etc.

### If some transactions are missing:

Check the category field - only transactions with recognized categories will be assigned. Unknown categories will be skipped.

### To see which transactions need manual assignment:

Run this query in Supabase SQL Editor:

```sql
SELECT id, description, category, type, amount
FROM transactions
WHERE account_id IS NULL
AND organization_id = 'your-org-id'
ORDER BY transaction_date;
```

## Files Created

1. **`database/scripts/assign-accounts-to-transactions.sql`** - SQL script for Supabase
2. **`scripts/assign-accounts.js`** - Node.js script
3. **`scripts/assign-accounts.ts`** - TypeScript version
4. **`scripts/assign-accounts.ps1`** - PowerShell script
5. **`scripts/assign-accounts.sh`** - Bash script
6. **`scripts/README.md`** - Script documentation

All scripts do the same thing - choose whichever is easiest for you!
