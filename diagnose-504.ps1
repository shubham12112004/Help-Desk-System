# Quick 504 Error Diagnosis Script
Write-Host "🔍 Diagnosing Supabase 504 Error..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing!" -ForegroundColor Red
    exit 1
}

# Test Supabase connection
Write-Host "`n1️⃣ Testing Supabase connection..." -ForegroundColor Yellow
node test-auth-endpoint.js

Write-Host "`n2️⃣ Testing database tables..." -ForegroundColor Yellow
node verify-supabase-setup.js

Write-Host "`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🩺 DIAGNOSIS COMPLETE" -ForegroundColor White -BackgroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see '✅ Auth service is healthy':" -ForegroundColor White
Write-Host "  → The 504 error is from SLOW EMAIL SERVICE" -ForegroundColor Cyan
Write-Host "  → Solution: Disable email confirmation" -ForegroundColor Green
Write-Host "  → Go to: https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn/auth/providers" -ForegroundColor Gray
Write-Host "  → Toggle OFF 'Confirm email' and Save" -ForegroundColor Gray
Write-Host ""

Write-Host "If you see '❌ 504 - Auth service is PAUSED':" -ForegroundColor White
Write-Host "  → Your project is paused (free tier)" -ForegroundColor Cyan
Write-Host "  → Solution: Restore your project" -ForegroundColor Green
Write-Host "  → Go to: https://supabase.com/dashboard/projects" -ForegroundColor Gray
Write-Host "  → Click 'Restore project' and wait 2 minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "Need more help? Read:" -ForegroundColor Yellow
Write-Host "  • SOLVING_504_SIGNUP.md (detailed guide)" -ForegroundColor Gray
Write-Host "  • FIXING_504_ERROR.md (troubleshooting)" -ForegroundColor Gray
Write-Host ""

Write-Host "Ready to test? Run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Green
