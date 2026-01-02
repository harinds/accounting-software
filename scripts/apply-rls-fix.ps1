#!/usr/bin/env pwsh

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Applying RLS Fix for Invoice Creation" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found at $envFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with:" -ForegroundColor Yellow
    Write-Host "SUPABASE_URL=your_supabase_url" -ForegroundColor Yellow
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env" -ForegroundColor Red
    exit 1
}

Write-Host "📋 IMPORTANT INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "The RLS (Row Level Security) policies need to be updated in Supabase." -ForegroundColor White
Write-Host "This requires running SQL migrations in the Supabase SQL Editor." -ForegroundColor White
Write-Host ""
Write-Host "🔧 Manual Steps Required:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your Supabase Dashboard:" -ForegroundColor White
Write-Host "   $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to: SQL Editor (left sidebar)" -ForegroundColor White
Write-Host ""
Write-Host "3. Run these SQL files in order:" -ForegroundColor White
Write-Host "   a) database/migrations/005_fix_invoice_rls.sql" -ForegroundColor Gray
Write-Host "   b) database/migrations/006_fix_all_rls_policies.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "📄 To run each file:" -ForegroundColor Cyan
Write-Host "   - Click 'New Query'" -ForegroundColor White
Write-Host "   - Copy the entire contents of the SQL file" -ForegroundColor White
Write-Host "   - Paste into the SQL Editor" -ForegroundColor White
Write-Host "   - Click 'Run' (or press Ctrl+Enter)" -ForegroundColor White
Write-Host ""
Write-Host "✅ After running both migrations:" -ForegroundColor Green
Write-Host "   - Try creating an invoice again" -ForegroundColor White
Write-Host "   - The invoice should now save to the database" -ForegroundColor White
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Ask user if they want to open the SQL file
Write-Host "Would you like to open the migration files now? (Y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    $migration1 = Join-Path $PSScriptRoot ".." "database" "migrations" "005_fix_invoice_rls.sql"
    $migration2 = Join-Path $PSScriptRoot ".." "database" "migrations" "006_fix_all_rls_policies.sql"

    if (Test-Path $migration1) {
        Start-Process notepad $migration1
        Write-Host "✅ Opened 005_fix_invoice_rls.sql" -ForegroundColor Green
    }

    if (Test-Path $migration2) {
        Start-Process notepad $migration2
        Write-Host "✅ Opened 006_fix_all_rls_policies.sql" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Copy the contents and paste them into Supabase SQL Editor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
