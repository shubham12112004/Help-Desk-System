// Quick test to check Supabase connectivity
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yoifuexgukjsfbqsmwrn.supabase.co';

console.log('🔍 Testing Supabase connection...');
console.log(`📍 URL: ${SUPABASE_URL}`);

fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: 'GET',
  headers: {
    'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
  },
})
  .then(response => {
    console.log(`\n✅ Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('✅ Supabase is responding correctly!');
    } else if (response.status === 504) {
      console.log('❌ 504 Gateway Timeout - Your Supabase project is PAUSED or DELETED');
      console.log('\n🔧 How to fix:');
      console.log('1. Go to https://supabase.com/dashboard/projects');
      console.log('2. Check if your project is paused');
      console.log('3. Click "Restore project" or "Unpause"');
      console.log('4. If deleted, create a new project and update .env');
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`);
    }
  })
  .catch(error => {
    console.log('\n❌ Connection failed:', error.message);
    console.log('\n🔧 Possible reasons:');
    console.log('- Project is paused (free tier pauses after inactivity)');
    console.log('- Project was deleted');
    console.log('- Wrong URL in .env file');
    console.log('- Network/firewall issue');
  });
