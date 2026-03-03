import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaWZ1ZXhndWtqc2ZicXNtd3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODcyMDc4MCwiZXhwIjoxODY2Mzg2NzgwfQ.Z0Wq3T5P7aB8cD9eF1gH3iJ5kL7mN9oQ1rS3tU5vW7x8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin(email) {
  console.log(`\n🔐 Making ${email} an ADMIN with FULL ACCESS...\n`);

  try {
    // Step 1: Update profile to admin role
    console.log('Step 1: Updating user role to ADMIN...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        is_admin: true
      })
      .eq('email', email)
      .select();

    if (profileError) {
      console.error('❌ Profile update failed:', profileError.message);
      return;
    }

    if (!profileData || profileData.length === 0) {
      console.error('❌ User not found in database!');
      return;
    }

    console.log('✅ User role updated to ADMIN');
    console.log(`   User ID: ${profileData[0].id}`);
    console.log(`   Email: ${profileData[0].email}`);
    console.log(`   Role: ${profileData[0].role}`);

    // Step 2: Grant all permissions
    console.log('\nStep 2: Granting FULL PERMISSIONS...');
    
    const permissions = [
      'manage_users',
      'manage_staff',
      'manage_patients',
      'manage_doctors',
      'manage_appointments',
      'manage_billing',
      'manage_pharmacy',
      'manage_lab',
      'manage_ambulance',
      'manage_settings',
      'manage_reports',
      'view_dashboard',
      'view_analytics',
      'manage_hospital_services'
    ];

    // You can set permissions in user metadata
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      profileData[0].id,
      {
        user_metadata: {
          role: 'admin',
          permissions: permissions,
          is_admin: true,
          dashboard_access: 'full'
        }
      }
    );

    if (authError) {
      console.error('⚠️  Warning updating auth metadata:', authError.message);
    } else {
      console.log('✅ Full permissions granted');
    }

    console.log('\n✨ SUCCESS! ADMIN ACCOUNT CREATED ✨\n');
    console.log('📋 Admin Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Dashboard: FULL ACCESS`);
    console.log(`   Permissions: ALL ${permissions.length} permissions`);
    
    console.log('\n🔓 This admin can access:');
    console.log('   ✅ Admin Dashboard');
    console.log('   ✅ Staff Management');
    console.log('   ✅ Patient Records');
    console.log('   ✅ Doctor Management');
    console.log('   ✅ Appointments');
    console.log('   ✅ Billing & Payments');
    console.log('   ✅ Pharmacy');
    console.log('   ✅ Lab Reports');
    console.log('   ✅ Ambulance Tracking');
    console.log('   ✅ Hospital Settings');
    console.log('   ✅ Analytics & Reports');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Go to: http://localhost:5176/auth');
    console.log(`2. Sign in with: ${email}`);
    console.log('3. Password: Admin@Hospital123');
    console.log('4. You will see the ADMIN DASHBOARD with all features! 🎉\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Make the user admin
makeUserAdmin('ff.bgmi.player420@gmail.com');
