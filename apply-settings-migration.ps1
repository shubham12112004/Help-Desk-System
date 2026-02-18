# =====================================================
# Apply User Settings Database Migration
# =====================================================
# This script helps you apply the user_settings table migration
# to your Supabase database
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATABASE MIGRATION HELPER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "supabase\migrations\20260218000000_add_user_settings.sql"

# Check if file exists
if (-Not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found!" -ForegroundColor Red
    Write-Host "Expected location: $migrationFile" -ForegroundColor Yellow
    exit 1
}

# Read the SQL content
$sqlContent = Get-Content $migrationFile -Raw

# Copy to clipboard
try {
    $sqlContent | Set-Clipboard
    Write-Host "[SUCCESS] SQL migration copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Could not copy to clipboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "-------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Open your Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/_/sql/new" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. The SQL has been copied to your clipboard. Just:" -ForegroundColor White
Write-Host "   - Click in the SQL editor" -ForegroundColor Gray
Write-Host "   - Press Ctrl+V to paste" -ForegroundColor Gray
Write-Host "   - Click 'Run' button" -ForegroundColor Gray
Write-Host ""

Write-Host "3. After running, refresh your Settings page" -ForegroundColor White
Write-Host "   http://localhost:5174/settings" -ForegroundColor Cyan
Write-Host ""

Write-Host "What this migration does:" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow
Write-Host "- Creates user_settings table" -ForegroundColor Green
Write-Host "- Sets up notification preferences" -ForegroundColor Green
Write-Host "- Configures display and privacy settings" -ForegroundColor Green
Write-Host "- Enables Row Level Security (RLS)" -ForegroundColor Green
Write-Host "- Creates helper functions" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to view the SQL content..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SQL MIGRATION CONTENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host $sqlContent -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Need help? Check:" -ForegroundColor White
Write-Host "- Supabase Docs: https://supabase.com/docs" -ForegroundColor Cyan
Write-Host "- SQL Editor: https://supabase.com/docs/guides/database/sql-editor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
