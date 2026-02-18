# =====================================================
# Apply Ambulance Location Tracking Migration
# =====================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AMBULANCE LOCATION TRACKING MIGRATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$migrationPath = "supabase\migrations\20260218100000_add_ambulance_location_tracking.sql"

if (Test-Path $migrationPath) {
    $sqlContent = Get-Content $migrationPath -Raw
    
    # Copy to clipboard
    Set-Clipboard -Value $sqlContent
    
    Write-Host "[OK] Migration SQL copied to clipboard!" -ForegroundColor Green
    Write-Host "`nWhat this migration adds:" -ForegroundColor Yellow
    Write-Host "  * User location (latitude/longitude)" -ForegroundColor White
    Write-Host "  * Ambulance location (latitude/longitude)" -ForegroundColor White
    Write-Host "  * Distance and ETA fields" -ForegroundColor White
    Write-Host "  * Last location update timestamp`n" -ForegroundColor White
    
    Write-Host "STEPS TO APPLY:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Click 'SQL Editor' in left sidebar" -ForegroundColor White
    Write-Host "4. Click 'New query'" -ForegroundColor White
    Write-Host "5. Press Ctrl+V (paste from clipboard)" -ForegroundColor White
    Write-Host "6. Click 'Run' button or press Ctrl+Enter`n" -ForegroundColor White
    
    Write-Host "Migration SQL Preview:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host $sqlContent -ForegroundColor DarkGray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
