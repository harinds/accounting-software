-- Default Chart of Accounts (Australian Standard)
-- This is a template that will be created for each new organization

-- ASSETS (1000-1999)
INSERT INTO accounts (organization_id, code, name, type) VALUES
  -- Current Assets
  ('{{organization_id}}', '1000', 'Cash and Cash Equivalents', 'asset'),
  ('{{organization_id}}', '1010', 'Bank Account - Operating', 'asset'),
  ('{{organization_id}}', '1020', 'Petty Cash', 'asset'),
  ('{{organization_id}}', '1100', 'Accounts Receivable', 'asset'),
  ('{{organization_id}}', '1110', 'Trade Debtors', 'asset'),
  ('{{organization_id}}', '1120', 'Allowance for Doubtful Debts', 'asset'),
  ('{{organization_id}}', '1200', 'Inventory', 'asset'),
  ('{{organization_id}}', '1300', 'Prepaid Expenses', 'asset'),

  -- Fixed Assets
  ('{{organization_id}}', '1500', 'Property, Plant & Equipment', 'asset'),
  ('{{organization_id}}', '1510', 'Land & Buildings', 'asset'),
  ('{{organization_id}}', '1520', 'Plant & Equipment', 'asset'),
  ('{{organization_id}}', '1530', 'Motor Vehicles', 'asset'),
  ('{{organization_id}}', '1540', 'Furniture & Fixtures', 'asset'),
  ('{{organization_id}}', '1550', 'Computer Equipment', 'asset'),
  ('{{organization_id}}', '1560', 'Accumulated Depreciation', 'asset'),

  -- Intangible Assets
  ('{{organization_id}}', '1700', 'Intangible Assets', 'asset'),
  ('{{organization_id}}', '1710', 'Goodwill', 'asset'),
  ('{{organization_id}}', '1720', 'Patents & Trademarks', 'asset');

-- LIABILITIES (2000-2999)
INSERT INTO accounts (organization_id, code, name, type) VALUES
  -- Current Liabilities
  ('{{organization_id}}', '2000', 'Accounts Payable', 'liability'),
  ('{{organization_id}}', '2010', 'Trade Creditors', 'liability'),
  ('{{organization_id}}', '2100', 'GST Collected', 'liability'),
  ('{{organization_id}}', '2110', 'GST Paid', 'liability'),
  ('{{organization_id}}', '2120', 'PAYG Withholding Payable', 'liability'),
  ('{{organization_id}}', '2130', 'Superannuation Payable', 'liability'),
  ('{{organization_id}}', '2200', 'Short-term Loans', 'liability'),
  ('{{organization_id}}', '2300', 'Accrued Expenses', 'liability'),
  ('{{organization_id}}', '2400', 'Employee Entitlements', 'liability'),
  ('{{organization_id}}', '2410', 'Annual Leave Provision', 'liability'),
  ('{{organization_id}}', '2420', 'Long Service Leave Provision', 'liability'),

  -- Long-term Liabilities
  ('{{organization_id}}', '2500', 'Long-term Loans', 'liability'),
  ('{{organization_id}}', '2600', 'Mortgage Payable', 'liability');

-- EQUITY (3000-3999)
INSERT INTO accounts (organization_id, code, name, type) VALUES
  ('{{organization_id}}', '3000', 'Owner\'s Equity', 'equity'),
  ('{{organization_id}}', '3100', 'Retained Earnings', 'equity'),
  ('{{organization_id}}', '3200', 'Current Year Earnings', 'equity'),
  ('{{organization_id}}', '3300', 'Owner\'s Drawings', 'equity');

-- REVENUE (4000-4999)
INSERT INTO accounts (organization_id, code, name, type, tax_type) VALUES
  ('{{organization_id}}', '4000', 'Sales Revenue', 'revenue', 'GST'),
  ('{{organization_id}}', '4010', 'Product Sales', 'revenue', 'GST'),
  ('{{organization_id}}', '4020', 'Service Revenue', 'revenue', 'GST'),
  ('{{organization_id}}', '4100', 'Other Revenue', 'revenue', 'GST'),
  ('{{organization_id}}', '4110', 'Interest Income', 'revenue', 'Input Taxed'),
  ('{{organization_id}}', '4120', 'Dividend Income', 'revenue', 'Input Taxed'),
  ('{{organization_id}}', '4200', 'Discounts & Rebates', 'revenue', 'GST');

-- EXPENSES (5000-9999)
INSERT INTO accounts (organization_id, code, name, type, tax_type) VALUES
  -- Cost of Goods Sold
  ('{{organization_id}}', '5000', 'Cost of Goods Sold', 'expense', 'GST'),
  ('{{organization_id}}', '5010', 'Purchases', 'expense', 'GST'),
  ('{{organization_id}}', '5020', 'Freight & Delivery', 'expense', 'GST'),
  ('{{organization_id}}', '5030', 'Materials & Supplies', 'expense', 'GST'),

  -- Operating Expenses
  ('{{organization_id}}', '6000', 'Advertising & Marketing', 'expense', 'GST'),
  ('{{organization_id}}', '6100', 'Bank Fees & Charges', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '6200', 'Communication Expenses', 'expense', 'GST'),
  ('{{organization_id}}', '6210', 'Telephone & Internet', 'expense', 'GST'),
  ('{{organization_id}}', '6220', 'Postage', 'expense', 'GST'),
  ('{{organization_id}}', '6300', 'Computer & IT Expenses', 'expense', 'GST'),
  ('{{organization_id}}', '6310', 'Software Subscriptions', 'expense', 'GST'),
  ('{{organization_id}}', '6400', 'Insurance', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '6500', 'Legal & Professional Fees', 'expense', 'GST'),
  ('{{organization_id}}', '6510', 'Accounting Fees', 'expense', 'GST'),
  ('{{organization_id}}', '6520', 'Legal Fees', 'expense', 'GST'),
  ('{{organization_id}}', '6530', 'Consulting Fees', 'expense', 'GST'),
  ('{{organization_id}}', '6600', 'Motor Vehicle Expenses', 'expense', 'GST'),
  ('{{organization_id}}', '6610', 'Fuel', 'expense', 'GST'),
  ('{{organization_id}}', '6620', 'Registration & Insurance', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '6630', 'Repairs & Maintenance', 'expense', 'GST'),
  ('{{organization_id}}', '6700', 'Office Expenses', 'expense', 'GST'),
  ('{{organization_id}}', '6710', 'Stationery & Printing', 'expense', 'GST'),
  ('{{organization_id}}', '6720', 'Office Supplies', 'expense', 'GST'),
  ('{{organization_id}}', '6800', 'Rent & Occupancy', 'expense', 'GST'),
  ('{{organization_id}}', '6810', 'Rent', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '6820', 'Utilities', 'expense', 'GST'),
  ('{{organization_id}}', '6900', 'Wages & Salaries', 'expense', 'GST Free'),
  ('{{organization_id}}', '6910', 'Salaries', 'expense', 'GST Free'),
  ('{{organization_id}}', '6920', 'Superannuation', 'expense', 'GST Free'),
  ('{{organization_id}}', '6930', 'Workers Compensation', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '7000', 'Travel & Accommodation', 'expense', 'GST'),
  ('{{organization_id}}', '7100', 'Meals & Entertainment', 'expense', 'GST'),
  ('{{organization_id}}', '7200', 'Training & Development', 'expense', 'GST'),
  ('{{organization_id}}', '7300', 'Subscriptions & Memberships', 'expense', 'GST'),
  ('{{organization_id}}', '7400', 'Depreciation', 'expense', 'GST Free'),
  ('{{organization_id}}', '7500', 'Bad Debts', 'expense', 'GST'),
  ('{{organization_id}}', '8000', 'Interest Expense', 'expense', 'Input Taxed'),
  ('{{organization_id}}', '9000', 'Other Expenses', 'expense', 'GST');

-- This seed file is a template. Replace {{organization_id}} with actual organization UUID when creating accounts.
