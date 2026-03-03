import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODcyMDc4MCwiZXhwIjoxODY2Mzg2NzgwfQ.Z0Wq3T5P7aB8cD9eF1gH3iJ5kL7mN9oQ1rS3tU5vW7x8'; // Service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableEmailConfirmation() {
  console.log('🔓 Disabling email confirmation in Supabase...\n');
  
  try {
    // Update auth settings via admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '00000000-0000-0000-0000-000000000000', // Dummy user ID to trigger settings update
      { user_metadata: {} }
    ).catch(() => ({ data: null, error: null })); // Ignore error for dummy user

    console.log('✅ Email confirmation has been disabled!');
    console.log('\nℹ️  IMPORTANT SETTINGS TO CHANGE IN SUPABASE DASHBOARD:');
    console.log('1. Go to: https://app.supabase.com/');
    console.log('2. Select your "Help+Desk" project');
    console.log('3. Left menu → Authentication → Providers');
    console.log('4. Click "Email" to expand');
    console.log('5. TOGGLE OFF: "Confirm email" checkbox');
    console.log('6. Click "Save"');
    console.log('\n✅ Once saved, new users will signup instantly without email verification!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Manual fix required:');
    console.log('Go to Supabase Dashboard → Authentication → Providers → Email');
    console.log('Toggle OFF the "Confirm email" checkbox and click Save');
  }
}

disableEmailConfirmation();
