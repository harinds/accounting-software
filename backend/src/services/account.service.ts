import { supabaseAdmin as supabase } from '../config/supabase';

interface Account {
  id?: string;
  organization_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  tax_type?: string;
  parent_account_id?: string;
  is_active?: boolean;
}

export const accountService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(accountData: Account) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, accountData: Partial<Account>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async seedChartOfAccounts(organizationId: string) {
    // Check if accounts already exist
    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1);

    if (existing && existing.length > 0) {
      return { message: 'Chart of accounts already exists', count: 0 };
    }

    // Get default chart of accounts
    const chartOfAccounts = getDefaultChartOfAccounts(organizationId);

    // Insert accounts
    const { data, error } = await supabase
      .from('accounts')
      .insert(chartOfAccounts)
      .select();

    if (error) throw error;

    return { message: 'Chart of accounts created successfully', count: data.length };
  }
};

function getDefaultChartOfAccounts(organizationId: string): Account[] {
  return [
    // ASSETS (1000-1999)
    { organization_id: organizationId, code: '1000', name: 'Cash and Cash Equivalents', type: 'asset' },
    { organization_id: organizationId, code: '1010', name: 'Bank Account - Operating', type: 'asset' },
    { organization_id: organizationId, code: '1020', name: 'Petty Cash', type: 'asset' },
    { organization_id: organizationId, code: '1100', name: 'Accounts Receivable', type: 'asset' },
    { organization_id: organizationId, code: '1110', name: 'Trade Debtors', type: 'asset' },
    { organization_id: organizationId, code: '1200', name: 'Inventory', type: 'asset' },
    { organization_id: organizationId, code: '1300', name: 'Prepaid Expenses', type: 'asset' },
    { organization_id: organizationId, code: '1500', name: 'Property, Plant & Equipment', type: 'asset' },
    { organization_id: organizationId, code: '1510', name: 'Land & Buildings', type: 'asset' },
    { organization_id: organizationId, code: '1520', name: 'Plant & Equipment', type: 'asset' },
    { organization_id: organizationId, code: '1530', name: 'Motor Vehicles', type: 'asset' },
    { organization_id: organizationId, code: '1540', name: 'Furniture & Fixtures', type: 'asset' },
    { organization_id: organizationId, code: '1550', name: 'Computer Equipment', type: 'asset' },
    { organization_id: organizationId, code: '1560', name: 'Accumulated Depreciation', type: 'asset' },

    // LIABILITIES (2000-2999)
    { organization_id: organizationId, code: '2000', name: 'Accounts Payable', type: 'liability' },
    { organization_id: organizationId, code: '2010', name: 'Trade Creditors', type: 'liability' },
    { organization_id: organizationId, code: '2100', name: 'GST Collected', type: 'liability' },
    { organization_id: organizationId, code: '2110', name: 'GST Paid', type: 'liability' },
    { organization_id: organizationId, code: '2120', name: 'PAYG Withholding Payable', type: 'liability' },
    { organization_id: organizationId, code: '2130', name: 'Superannuation Payable', type: 'liability' },
    { organization_id: organizationId, code: '2200', name: 'Short-term Loans', type: 'liability' },
    { organization_id: organizationId, code: '2300', name: 'Accrued Expenses', type: 'liability' },
    { organization_id: organizationId, code: '2400', name: 'Employee Entitlements', type: 'liability' },
    { organization_id: organizationId, code: '2500', name: 'Long-term Loans', type: 'liability' },

    // EQUITY (3000-3999)
    { organization_id: organizationId, code: '3000', name: "Owner's Equity", type: 'equity' },
    { organization_id: organizationId, code: '3100', name: 'Retained Earnings', type: 'equity' },
    { organization_id: organizationId, code: '3200', name: 'Current Year Earnings', type: 'equity' },
    { organization_id: organizationId, code: '3300', name: "Owner's Drawings", type: 'equity' },

    // REVENUE (4000-4999)
    { organization_id: organizationId, code: '4000', name: 'Sales Revenue', type: 'revenue', tax_type: 'GST' },
    { organization_id: organizationId, code: '4010', name: 'Product Sales', type: 'revenue', tax_type: 'GST' },
    { organization_id: organizationId, code: '4020', name: 'Service Revenue', type: 'revenue', tax_type: 'GST' },
    { organization_id: organizationId, code: '4100', name: 'Other Revenue', type: 'revenue', tax_type: 'GST' },
    { organization_id: organizationId, code: '4110', name: 'Interest Income', type: 'revenue', tax_type: 'Input Taxed' },

    // EXPENSES (5000-9999)
    { organization_id: organizationId, code: '5000', name: 'Cost of Goods Sold', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '5010', name: 'Purchases', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '5020', name: 'Freight & Delivery', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6000', name: 'Advertising & Marketing', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6100', name: 'Bank Fees & Charges', type: 'expense', tax_type: 'Input Taxed' },
    { organization_id: organizationId, code: '6200', name: 'Communication Expenses', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6210', name: 'Telephone & Internet', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6300', name: 'Computer & IT Expenses', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6310', name: 'Software Subscriptions', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6400', name: 'Insurance', type: 'expense', tax_type: 'Input Taxed' },
    { organization_id: organizationId, code: '6500', name: 'Legal & Professional Fees', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6510', name: 'Accounting Fees', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6520', name: 'Legal Fees', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6600', name: 'Motor Vehicle Expenses', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6610', name: 'Fuel', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6700', name: 'Office Expenses', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6710', name: 'Stationery & Printing', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6800', name: 'Rent & Occupancy', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6810', name: 'Rent', type: 'expense', tax_type: 'Input Taxed' },
    { organization_id: organizationId, code: '6820', name: 'Utilities', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '6900', name: 'Wages & Salaries', type: 'expense', tax_type: 'GST Free' },
    { organization_id: organizationId, code: '6910', name: 'Salaries', type: 'expense', tax_type: 'GST Free' },
    { organization_id: organizationId, code: '6920', name: 'Superannuation', type: 'expense', tax_type: 'GST Free' },
    { organization_id: organizationId, code: '7000', name: 'Travel & Accommodation', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '7100', name: 'Meals & Entertainment', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '7200', name: 'Training & Development', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '7300', name: 'Subscriptions & Memberships', type: 'expense', tax_type: 'GST' },
    { organization_id: organizationId, code: '7400', name: 'Depreciation', type: 'expense', tax_type: 'GST Free' },
    { organization_id: organizationId, code: '8000', name: 'Interest Expense', type: 'expense', tax_type: 'Input Taxed' },
    { organization_id: organizationId, code: '9000', name: 'Other Expenses', type: 'expense', tax_type: 'GST' }
  ];
}
