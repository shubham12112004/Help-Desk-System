# Supabase Configuration Validator
# Run this script to check if your Supabase is properly configured

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        SUPABASE CONFIGURATION VALIDATOR                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$hasError = $false

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ CRITICAL: .env file not found!" -ForegroundColor Red
    Write-Host "   Action: Create a .env file in the project root`n" -ForegroundColor Yellow
    $hasError = $true
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Read .env content
$envContent = Get-Content .env -Raw

# Check VITE_SUPABASE_URL
if ($envContent -match 'VITE_SUPABASE_URL=(.+)') {
    $url = $matches[1].Trim()
    if ($url -eq "https://zbvjkakyjvnmiabnnbvz.supabase.co") {
        Write-Host "✅ Supabase URL is correct" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Supabase URL mismatch!" -ForegroundColor Yellow
        Write-Host "   Expected: https://zbvjkakyjvnmiabnnbvz.supabase.co" -ForegroundColor Gray
        Write-Host "   Found: $url`n" -ForegroundColor Gray
        $hasError = $true
    }
} else {
    Write-Host "❌ VITE_SUPABASE_URL not found in .env" -ForegroundColor Red
    $hasError = $true
}

# Check VITE_SUPABASE_ANON_KEY
Write-Host ""
if ($envContent -match 'VITE_SUPABASE_ANON_KEY=(.+)') {
    $key = $matches[1].Trim()
    
    if ($key -eq "YOUR_ANON_KEY_HERE") {
        Write-Host "❌ Anon key NOT configured!" -ForegroundColor Red
        Write-Host "   Action: Replace YOUR_ANON_KEY_HERE with your actual key" -ForegroundColor Yellow
        Write-Host "   Get key from: https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/settings/api`n" -ForegroundColor Cyan
        $hasError = $true
    }
    elseif ($key.StartsWith("sb_publishable_")) {
        Write-Host "❌ Invalid key format!" -ForegroundColor Red
        Write-Host "   Your key starts with 'sb_publishable_' which is wrong" -ForegroundColor Yellow
        Write-Host "   The correct key should start with 'eyJhbGc' and be ~300 chars" -ForegroundColor Yellow
        Write-Host "   Get the correct 'anon' key from Supabase dashboard`n" -ForegroundColor Cyan
        $hasError = $true
    }
    elseif ($key.StartsWith("eyJhbGc") -and $key.Length -gt 100) {
        Write-Host "✅ Anon key appears valid!" -ForegroundColor Green
        Write-Host "   Format: Correct (JWT token)" -ForegroundColor Gray
        Write-Host "   Length: $($key.Length) characters`n" -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Anon key format looks suspicious" -ForegroundColor Yellow
        Write-Host "   Length: $($key.Length) characters" -ForegroundColor Gray
        Write-Host "   Expected length: ~300 characters" -ForegroundColor Gray
        Write-Host "   Should start with: eyJhbGc`n" -ForegroundColor Gray
        $hasError = $true
    }
} else {
    Write-Host "❌ VITE_SUPABASE_ANON_KEY not found in .env" -ForegroundColor Red
    $hasError = $true
}

# Final verdict
Write-Host ""
Write-Host ("=" * 60)
Write-Host ""

if ($hasError) {
    Write-Host "🚨 CONFIGURATION INCOMPLETE" -ForegroundColor Red
    Write-Host "`nYour app will NOT work until you fix the issues above." -ForegroundColor Yellow
    Write-Host "`n📖 Help files:" -ForegroundColor Cyan
    Write-Host "   • START_HERE.md - Main instructions" -ForegroundColor White
    Write-Host "   • QUICK_START.txt - Visual guide" -ForegroundColor White
    Write-Host "   • SUPABASE_SETUP.md - Troubleshooting`n" -ForegroundColor White
} else {
    Write-Host "✅ CONFIGURATION LOOKS GOOD!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart dev server: npm run dev" -ForegroundColor White
    Write-Host "   2. Open: http://localhost:5176/auth" -ForegroundColor White
    Write-Host "   3. Try signing up/in" -ForegroundColor White
    Write-Host "`nIf you still see warnings, check browser console (F12)`n" -ForegroundColor Yellow
}

Write-Host ("=" * 60)
Write-Host ""
