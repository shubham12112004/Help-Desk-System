import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5Njc3ODcsImV4cCI6MjAyOTU0Mzc4N30.QzXx7gJLJXM2lA9F0V5_sYCHwfzPHY5m2JF_ChJnfVU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminRole() {
  try {
    console.log('🔄 Updating user role to admin...\n');

    // Update the profile role in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', 'ff.bgmi.player420@gmail.com')
      .select();

    if (profileError) {
      console.error('❌ Error updating profile role:', profileError);
      return;
    }

    if (!profileData || profileData.length === 0) {
      console.error('❌ User profile not found');
      return;
    }

    console.log('✅ Successfully updated user role to admin!\n');
    console.log('Updated Profile:');
    console.log('  Email:', profileData[0]?.email);
    console.log('  Role:', profileData[0]?.role);
    console.log('  Full Name:', profileData[0]?.full_name);

    console.log('\n📋 Next Steps:');
    console.log('1. Go to http://localhost:5177/dashboard');
    console.log('2. Logout (click profile menu in top right)');
    console.log('3. Login again with:');
    console.log('   Email: ff.bgmi.player420@gmail.com');
    console.log('   Password: Admin@12345');
    console.log('4. You should now see the Admin Control Panel with 8 management features!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateAdminRole();
