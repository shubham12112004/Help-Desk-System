// Verify Supabase auth and database setup
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yoifuexgukjsfbqsmwrn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('🔍 Testing Supabase Setup\n');
  
  // 1. Test connection
  console.log('1️⃣ Testing REST API connection...');
  const { data: healthCheck, error: healthError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);
  
  if (healthError) {
    if (healthError.code === '42P01') {
      console.log('❌ profiles table does not exist');
      console.log('   Run migrations: cd supabase && supabase db push');
    } else {
      console.log('❌ Connection error:', healthError.message);
    }
  } else {
    console.log('✅ Database connected');
  }

  // 2. Test auth endpoint
  console.log('\n2️⃣ Testing Auth API...');
  try {
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth API is working');
    console.log('   Current session:', session.session ? 'Active' : 'None');
  } catch (error) {
    console.log('❌ Auth API error:', error.message);
  }

  // 3. Check required tables
  console.log('\n3️⃣ Checking required tables...');
  const tables = ['profiles', 'user_roles', 'tickets', 'ticket_messages'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      console.log(`❌ ${table} - missing or inaccessible`);
    } else {
      console.log(`✅ ${table} - exists`);
    }
  }

  console.log('\n✅ Supabase setup verification complete!');
}

testSupabase().catch(console.error);
