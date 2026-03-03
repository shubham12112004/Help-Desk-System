import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzk2Nzc4NywiZXhwIjoyMDI5NTQzNzg3fQ.srX8X2m5Hd5yL0FhkHjMXVKSIEv0yVVKqEbXYYX6e90';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDeepakaToAdmin() {
  try {
    console.log('🔄 Updating Deepak account to ADMIN...\n');

    // Update ALL profiles named "Deepak" OR with role "Citizen" to admin
    // First, let's get Deepak's profile info
    const { data: profiles, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', '%deepak%');

    if (getError) {
      console.error('❌ Error fetching profiles:', getError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No profile found with name Deepak. Trying alternative...\n');
      
      // Try to find by role = citizen
      const { data: citizenProfiles, error: citizenError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'citizen')
        .limit(1);
      
      if (citizenError) {
        console.error('❌ Error fetching citizen profiles:', citizenError);
        return;
      }

      if (citizenProfiles && citizenProfiles.length > 0) {
        const profile = citizenProfiles[0];
        console.log('✓ Found Citizen profile:');
        console.log('  Name:', profile.full_name);
        console.log('  Email:', profile.email);
        console.log('  Current Role:', profile.role);
        
        // Update to admin
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
          .select();

        if (updateError) {
          console.error('❌ Error updating profile:', updateError);
          return;
        }

        console.log('\n✅ Successfully updated to ADMIN!\n');
        console.log('Updated Profile:');
        console.log('  Name:', updated[0]?.full_name);
        console.log('  Email:', updated[0]?.email);
        console.log('  New Role:', updated[0]?.role);
      }
    } else {
      // Update the Deepak profile
      const profile = profiles[0];
      console.log('✓ Found Deepak profile:');
      console.log('  Name:', profile.full_name);
      console.log('  Email:', profile.email);
      console.log('  Current Role:', profile.role);

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select();

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }

      console.log('\n✅ Successfully updated to ADMIN!\n');
      console.log('Updated Profile:');
      console.log('  Name:', updated[0]?.full_name);
      console.log('  Email:', updated[0]?.email);
      console.log('  New Role:', updated[0]?.role);
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
    console.log('2. Log out and log back in');
    console.log('3. You should now see:');
    console.log('   ✨ Admin Control Panel');
    console.log('   ✨ 8 Management Feature Cards');
    console.log('   ✨ Premium Admin Dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateDeepakaToAdmin();
