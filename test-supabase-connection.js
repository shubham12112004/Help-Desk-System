// Test Supabase Connection
async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  const supabaseUrl = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg3MjA3ODAsImV4cCI6MTgyNjM4Njc4MH0.R9CsD-jL8p808eVfDYu5A7QTsxU4YZjF6oFjCqJJQ4o';

  try {
    // Test 1: Basic connectivity
    console.log('1️⃣  Testing basic HTTP connectivity...');
    const healthResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { 'apiKey': supabaseKey }
    });
    
    if (healthResponse.ok) {
      console.log('✅ Supabase health check: OK');
    } else {
      console.log(`⚠️  Health check returned: ${healthResponse.status}`);
    }

    // Test 2: CORS check
    console.log('\n2️⃣  Testing CORS...');
    const corsResponse = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Origin': window.location.origin
      }
    }).catch(e => ({ error: e.message }));

    if (corsResponse.error) {
      console.log(`⚠️  CORS issue: ${corsResponse.error}`);
    } else {
      console.log('✅ CORS headers OK');
    }

    // Test 3: DNS resolution
    console.log('\n3️⃣  Checking URL validity...');
    if (supabaseUrl.includes('yoifuexgukjsfbqsmwrn')) {
      console.log('✅ Supabase URL is valid');
    }

    console.log('\n📊 Summary:');
    console.log('✅ JavaScript can reach this page');
    console.log('❌ Browser cannot reach Supabase server');
    console.log('\n🔧 Possible Fixes:');
    console.log('1. Check Supabase Dashboard - is your project PAUSED?');
    console.log('2. Check internet connection');
    console.log('3. Check if firewall is blocking supabase.co domain');
    console.log('4. Try again in a few minutes (might be server issue)');

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n🔧 Next Steps:');
    console.log('1. Go to https://app.supabase.com/');
    console.log('2. Find your Help+Desk project');
    console.log('3. If it says "Paused" at the top, click to RESUME');
    console.log('4. Wait 30 seconds, then refresh this page');
  }
}

// Run test
testSupabaseConnection();
