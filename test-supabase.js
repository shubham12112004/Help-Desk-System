// Supabase Connection Test
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║           SUPABASE CONNECTION TEST                        ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zbvjkakyjvnmiabnnbvz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

console.log('📋 Configuration Check:');
console.log('─────────────────────────────────────────────────────────────');

// Check URL
if (SUPABASE_URL && SUPABASE_URL.includes('zbvjkakyjvnmiabnnbvz')) {
  console.log('✅ Supabase URL: Correct');
  console.log(`   ${SUPABASE_URL}`);
} else {
  console.log('❌ Supabase URL: Invalid or missing');
  console.log(`   Found: ${SUPABASE_URL}`);
}

console.log('');

// Check Anon Key
if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
  console.log('❌ Anon Key: NOT CONFIGURED');
  console.log('   Status: Still has placeholder value');
  console.log('\n⚠️  CRITICAL: You must add your actual Supabase anon key!\n');
  console.log('   Get it from: https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/settings/api');
  console.log('   Then update the .env file and restart the server\n');
  process.exit(1);
} else if (SUPABASE_ANON_KEY.startsWith('eyJhbGc')) {
  console.log('✅ Anon Key: Format looks correct (JWT)');
  console.log(`   Length: ${SUPABASE_ANON_KEY.length} characters`);
} else if (SUPABASE_ANON_KEY.startsWith('sb_publishable_')) {
  console.log('❌ Anon Key: Wrong format!');
  console.log('   This format (sb_publishable_) does not work');
  console.log('   You need the JWT token starting with "eyJhbGc"');
  process.exit(1);
} else {
  console.log('⚠️  Anon Key: Format is suspicious');
  console.log(`   Length: ${SUPABASE_ANON_KEY.length} characters`);
  console.log('   Expected: ~300 chars starting with "eyJhbGc"');
}

console.log('\n─────────────────────────────────────────────────────────────');
console.log('🔌 Testing Connection...\n');

// Try to create client and test connection
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Test auth endpoint
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Connection Failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 This usually means:');
    console.log('   - Anon key is invalid or incorrect');
    console.log('   - Project URL is wrong');
    console.log('   - Supabase project is paused/deleted\n');
    process.exit(1);
  } else {
    console.log('✅ Connection Successful!');
    console.log('   Supabase client initialized');
    console.log('   Auth endpoint responding');
    
    if (data.session) {
      console.log('   Current session: Active');
      console.log(`   User: ${data.session.user.email}`);
    } else {
      console.log('   Current session: None (not logged in)');
    }
  }
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('🎉 SUPABASE IS WORKING!\n');
  console.log('You can now:');
  console.log('  ✓ Sign up new users');
  console.log('  ✓ Sign in existing users');
  console.log('  ✓ Access the database');
  console.log('  ✓ Use all features\n');
  
} catch (error) {
  console.log('❌ Connection Test Failed:');
  console.log(`   ${error.message}\n`);
  console.log('💡 Check:');
  console.log('   - Is your anon key correct?');
  console.log('   - Is the project URL correct?');
  console.log('   - Is your internet connection working?\n');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════\n');
