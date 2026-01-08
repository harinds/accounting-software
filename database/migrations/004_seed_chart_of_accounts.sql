-- Migration: Seed Chart of Accounts for existing organizations
-- This migration populates the chart of accounts for all existing organizations

DO $$
DECLARE
    org RECORD;
BEGIN
    -- Loop through all organizations
    FOR org IN SELECT id FROM organizations LOOP
        -- Check if organization already has accounts
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE organization_id = org.id LIMIT 1) THEN
            -- ASSETS (1000-1999)
            -- Current Assets
            INSERT INTO accounts (organization_id, code, name, type) VALUES
              (org.id, '1000', 'Cash and Cash Equivalents', 'asset'),
              (org.id, '1010', 'Bank Account - Operating', 'asset'),
              (org.id, '1020', 'Petty Cash', 'asset'),
              (org.id, '1100', 'Accounts Receivable', 'asset'),
              (org.id, '1110', 'Trade Debtors', 'asset'),
              (org.id, '1120', 'Allowance for Doubtful Debts', 'asset'),
              (org.id, '1200', 'Inventory', 'asset'),
              (org.id, '1300', 'Prepaid Expenses', 'asset'),

              -- Fixed Assets
              (org.id, '1500', 'Property, Plant & Equipment', 'asset'),
              (org.id, '1510', 'Land & Buildings', 'asset'),
              (org.id, '1520', 'Plant & Equipment', 'asset'),
              (org.id, '1530', 'Motor Vehicles', 'asset'),
              (org.id, '1540', 'Furniture & Fixtures', 'asset'),
              (org.id, '1550', 'Computer Equipment', 'asset'),
              (org.id, '1560', 'Accumulated Depreciation', 'asset'),

              -- Intangible Assets
              (org.id, '1700', 'Intangible Assets', 'asset'),
              (org.id, '1710', 'Goodwill', 'asset'),
              (org.id, '1720', 'Patents & Trademarks', 'asset');

            -- LIABILITIES (2000-2999)
            -- Current Liabilities
            INSERT INTO accounts (organization_id, code, name, type) VALUES
              (org.id, '2000', 'Accounts Payable', 'liability'),
              (org.id, '2010', 'Trade Creditors', 'liability'),
              (org.id, '2100', 'GST Collected', 'liability'),
              (org.id, '2110', 'GST Paid', 'liability'),
              (org.id, '2120', 'PAYG Withholding Payable', 'liability'),
              (org.id, '2130', 'Superannuation Payable', 'liability'),
              (org.id, '2200', 'Short-term Loans', 'liability'),
              (org.id, '2300', 'Accrued Expenses', 'liability'),
              (org.id, '2400', 'Employee Entitlements', 'liability'),
              (org.id, '2410', 'Annual Leave Provision', 'liability'),
              (org.id, '2420', 'Long Service Leave Provision', 'liability'),

              -- Long-term Liabilities
              (org.id, '2500', 'Long-term Loans', 'liability'),
              (org.id, '2600', 'Mortgage Payable', 'liability');

            -- EQUITY (3000-3999)
            INSERT INTO accounts (organization_id, code, name, type) VALUES
              (org.id, '3000', 'Owner''s Equity', 'equity'),
              (org.id, '3100', 'Retained Earnings', 'equity'),
              (org.id, '3200', 'Current Year Earnings', 'equity'),
              (org.id, '3300', 'Owner''s Drawings', 'equity');

            -- REVENUE (4000-4999)
            INSERT INTO accounts (organization_id, code, name, type, tax_type) VALUES
              (org.id, '4000', 'Sales Revenue', 'revenue', 'GST'),
              (org.id, '4010', 'Product Sales', 'revenue', 'GST'),
              (org.id, '4020', 'Service Revenue', 'revenue', 'GST'),
              (org.id, '4100', 'Other Revenue', 'revenue', 'GST'),
              (org.id, '4110', 'Interest Income', 'revenue', 'Input Taxed'),
              (org.id, '4120', 'Dividend Income', 'revenue', 'Input Taxed'),
              (org.id, '4200', 'Discounts & Rebates', 'revenue', 'GST');

            -- EXPENSES (5000-9999)
            -- Cost of Goods Sold
            INSERT INTO accounts (organization_id, code, name, type, tax_type) VALUES
              (org.id, '5000', 'Cost of Goods Sold', 'expense', 'GST'),
              (org.id, '5010', 'Purchases', 'expense', 'GST'),
              (org.id, '5020', 'Freight & Delivery', 'expense', 'GST'),
              (org.id, '5030', 'Materials & Supplies', 'expense', 'GST'),

              -- Operating Expenses
              (org.id, '6000', 'Advertising & Marketing', 'expense', 'GST'),
              (org.id, '6100', 'Bank Fees & Charges', 'expense', 'Input Taxed'),
              (org.id, '6200', 'Communication Expenses', 'expense', 'GST'),
              (org.id, '6210', 'Telephone & Internet', 'expense', 'GST'),
              (org.id, '6220', 'Postage', 'expense', 'GST'),
              (org.id, '6300', 'Computer & IT Expenses', 'expense', 'GST'),
              (org.id, '6310', 'Software Subscriptions', 'expense', 'GST'),
              (org.id, '6400', 'Insurance', 'expense', 'Input Taxed'),
              (org.id, '6500', 'Legal & Professional Fees', 'expense', 'GST'),
              (org.id, '6510', 'Accounting Fees', 'expense', 'GST'),
              (org.id, '6520', 'Legal Fees', 'expense', 'GST'),
              (org.id, '6530', 'Consulting Fees', 'expense', 'GST'),
              (org.id, '6600', 'Motor Vehicle Expenses', 'expense', 'GST'),
              (org.id, '6610', 'Fuel', 'expense', 'GST'),
              (org.id, '6620', 'Registration & Insurance', 'expense', 'Input Taxed'),
              (org.id, '6630', 'Repairs & Maintenance', 'expense', 'GST'),
              (org.id, '6700', 'Office Expenses', 'expense', 'GST'),
              (org.id, '6710', 'Stationery & Printing', 'expense', 'GST'),
              (org.id, '6720', 'Office Supplies', 'expense', 'GST'),
              (org.id, '6800', 'Rent & Occupancy', 'expense', 'GST'),
              (org.id, '6810', 'Rent', 'expense', 'Input Taxed'),
              (org.id, '6820', 'Utilities', 'expense', 'GST'),
              (org.id, '6900', 'Wages & Salaries', 'expense', 'GST Free'),
              (org.id, '6910', 'Salaries', 'expense', 'GST Free'),
              (org.id, '6920', 'Superannuation', 'expense', 'GST Free'),
              (org.id, '6930', 'Workers Compensation', 'expense', 'Input Taxed'),
              (org.id, '7000', 'Travel & Accommodation', 'expense', 'GST'),
              (org.id, '7100', 'Meals & Entertainment', 'expense', 'GST'),
              (org.id, '7200', 'Training & Development', 'expense', 'GST'),
              (org.id, '7300', 'Subscriptions & Memberships', 'expense', 'GST'),
              (org.id, '7400', 'Depreciation', 'expense', 'GST Free'),
              (org.id, '7500', 'Bad Debts', 'expense', 'GST'),
              (org.id, '8000', 'Interest Expense', 'expense', 'Input Taxed'),
              (org.id, '9000', 'Other Expenses', 'expense', 'GST');

            RAISE NOTICE 'Created chart of accounts for organization %', org.id;
        ELSE
            RAISE NOTICE 'Organization % already has accounts, skipping', org.id;
        END IF;
    END LOOP;
END $$;
