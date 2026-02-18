// Test Supabase Auth endpoint directly
const SUPABASE_URL = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTgyNDcsImV4cCI6MjA4NjUzNDI0N30.l2iiS3Z46y3B7uw99L77mMPpzPusUoc-3AFnvaRp808';

console.log('🔍 Testing Supabase Auth Endpoints\n');

// Test 1: Check auth health
console.log('1️⃣ Testing /auth/v1/health...');
fetch(`${SUPABASE_URL}/auth/v1/health`, {
  headers: { 'apikey': ANON_KEY }
})
  .then(res => {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (res.status === 200) {
      console.log('   ✅ Auth service is healthy');
    } else if (res.status === 504) {
      console.log('   ❌ 504 - Auth service is PAUSED or DOWN');
    }
    return res.text();
  })
  .then(text => console.log('   Response:', text.substring(0, 100)))
  .catch(err => console.log('   ❌ Error:', err.message))
  .then(() => {
    // Test 2: Get auth settings
    console.log('\n2️⃣ Testing /auth/v1/settings...');
    return fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { 
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
  })
  .then(res => {
    console.log(`   Status: ${res.status}`);
    return res.json();
  })
  .then(settings => {
    console.log('   ✅ Auth Settings:');
    console.log('      - Email confirmations:', settings.external?.email ? 'Enabled' : 'Disabled');
    console.log('      - Sign up enabled:', settings.disable_signup ? 'NO ❌' : 'YES ✅');
    console.log('      - Autoconfirm:', settings.mailer_autoconfirm ? 'YES' : 'NO');
  })
  .catch(err => console.log('   ❌ Settings error:', err.message))
  .then(() => {
    console.log('\n💡 If you see 504 errors:');
    console.log('   1. Go to https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn');
    console.log('   2. Check project status (it may be paused)');
    console.log('   3. Click "Restore project" if paused');
    console.log('   4. Wait 2-3 minutes for it to wake up');
  });
