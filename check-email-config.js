// Check if email confirmation is disabled
const SUPABASE_URL = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTgyNDcsImV4cCI6MjA4NjUzNDI0N30.l2iiS3Z46y3B7uw99L77mMPpzPusUoc-3AFnvaRp808';

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 CHECKING SUPABASE AUTH CONFIGURATION');
console.log('═══════════════════════════════════════════════════════\n');

fetch(`${SUPABASE_URL}/auth/v1/settings`, {
  headers: { 
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(settings => {
    console.log('📊 Current Settings:\n');
    
    const emailConfirmEnabled = !settings.mailer_autoconfirm;
    const signupEnabled = !settings.disable_signup;
    
    console.log(`   Sign up enabled: ${signupEnabled ? '✅ YES' : '❌ NO'}`);
    console.log(`   Email confirmation: ${emailConfirmEnabled ? '❌ ENABLED (causing 504!)' : '✅ DISABLED (good!)'}`);
    console.log(`   Autoconfirm: ${settings.mailer_autoconfirm ? '✅ YES (instant signup)' : '❌ NO (slow email)'}`);
    
    console.log('\n═══════════════════════════════════════════════════════');
    
    if (emailConfirmEnabled) {
      console.log('⚠️  EMAIL CONFIRMATION IS ENABLED - THIS CAUSES 504 ERROR!');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('🚨 WHY YOU GET 504 ERROR:\n');
      console.log('   1. You click "Create Account"');
      console.log('   2. Supabase tries to send confirmation email');
      console.log('   3. Email service is VERY SLOW (40-90 seconds on free tier)');
      console.log('   4. Your browser times out after 30 seconds');
      console.log('   5. ❌ 504 Gateway Timeout Error\n');
      console.log('✅ HOW TO FIX:\n');
      console.log('   Step 1: Go to this URL:');
      console.log('   👉 https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn/auth/providers\n');
      console.log('   Step 2: Find "Email" provider section');
      console.log('   Step 3: Toggle OFF "Confirm email"');
      console.log('   Step 4: Click "Save"');
      console.log('   Step 5: Run this script again to verify\n');
      console.log('   📖 Detailed guide: HOW_TO_DISABLE_EMAIL_CONFIRMATION.txt\n');
    } else {
      console.log('✅ EMAIL CONFIRMATION IS DISABLED - SIGNUP SHOULD WORK!');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('🎉 Configuration is correct!\n');
      console.log('   Signup should be INSTANT (1-2 seconds)');
      console.log('   No email verification needed');
      console.log('   Users can log in immediately\n');
      console.log('🧪 Test your app:');
      console.log('   1. Make sure dev server is running: npm run dev');
      console.log('   2. Go to: http://localhost:5173/auth');
      console.log('   3. Try signing up - should work immediately!\n');
      console.log('   If still getting 504:');
      console.log('   • Clear browser cache (Ctrl+Shift+Delete)');
      console.log('   • Try incognito/private window');
      console.log('   • Restart dev server\n');
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
  })
  .catch(error => {
    console.log('❌ Error checking settings:', error.message);
    console.log('\nPossible reasons:');
    console.log('  • Network error');
    console.log('  • Supabase project is paused');
    console.log('  • Invalid API key\n');
  });
