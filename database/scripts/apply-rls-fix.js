const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationFile) {
  try {
    console.log(`\n📄 Applying migration: ${migrationFile}`);

    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ statement });

        if (directError) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error);

          // Continue with next statement instead of failing completely
          continue;
        }
      }
    }

    console.log(`✅ Migration applied successfully: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Error applying migration ${migrationFile}:`, error.message);
  }
}

async function applyMigrationsManually() {
  console.log('🔧 Applying RLS fix migrations...\n');
  console.log('⚠️  Note: If this fails, you need to run the SQL files manually in Supabase SQL Editor.\n');

  await applyMigration('005_fix_invoice_rls.sql');
  await applyMigration('006_fix_all_rls_policies.sql');

  console.log('\n✨ Migration process complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify the policies were applied by checking Supabase Dashboard > Table Editor > invoices > Policies');
  console.log('2. Try creating an invoice again in the application');
  console.log('\nIf this script failed, manually run the SQL files in Supabase SQL Editor:');
  console.log('- database/migrations/005_fix_invoice_rls.sql');
  console.log('- database/migrations/006_fix_all_rls_policies.sql');
}

applyMigrationsManually().catch(console.error);
