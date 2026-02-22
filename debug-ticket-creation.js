#!/usr/bin/env node

/**
 * Debug Script for Ticket Creation Issues
 * Run this after you get the "something went wrong" error
 * Shows what's failing when creating tickets
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 TICKET CREATION DIAGNOSTIC\n');

// 1. Check if environment variables are set
console.log('1️⃣ Checking Environment Variables...\n');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = env.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = env.includes('VITE_SUPABASE_ANON_KEY=');
  
  console.log(`  ✓ VITE_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`  ✓ VITE_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('\n  ⚠️ Missing Supabase credentials in .env');
    console.log('  Fix: Update .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
} else {
  console.log('  ❌ .env file not found');
}

// 2. Check if tickets table exists in database structure
console.log('\n2️⃣ Checking Tickets Service...\n');
const ticketServicePath = path.join(process.cwd(), 'src/services/tickets.js');
if (fs.existsSync(ticketServicePath)) {
  const content = fs.readFileSync(ticketServicePath, 'utf8');
  const hasCreateTicket = content.includes('export async function createTicket');
  const hasInsert = content.includes('.insert(');
  
  console.log(`  ✓ createTicket function: ${hasCreateTicket ? '✅ Found' : '❌ Missing'}`);
  console.log(`  ✓ Database insert: ${hasInsert ? '✅ Found' : '❌ Missing'}`);
} else {
  console.log('  ❌ tickets.js service file not found');
}

// 3. Check if CreateTicket page is configured
console.log('\n3️⃣ Checking CreateTicket Page...\n');
const createTicketPath = path.join(process.cwd(), 'src/pages/CreateTicket.jsx');
if (fs.existsSync(createTicketPath)) {
  const content = fs.readFileSync(createTicketPath, 'utf8');
  const hasCreateTicket = content.includes('createTicket.');
  const hasErrorHandling = content.includes('toast.error');
  
  console.log(`  ✓ Uses createTicket hook: ${hasCreateTicket ? '✅ Yes' : '❌ No'}`);
  console.log(`  ✓ Error handling: ${hasErrorHandling ? '✅ Yes' : '❌ No'}`);
} else {
  console.log('  ❌ CreateTicket.jsx page not found');
}

// 4. Common issues and solutions
console.log('\n4️⃣ Possible Issues & Solutions:\n');
console.log('  Issue 1: "User not authenticated"');
console.log('    → Solution: Make sure you\'re logged in (admin@hospital.local)');
console.log('    → Check: Browser console for auth errors\n');

console.log('  Issue 2: "Permission denied" or "RLS policy"');
console.log('    → Solution: Check Supabase RLS policies on tickets table');
console.log('    → Check: Supabase Dashboard > Auth > Policies\n');

console.log('  Issue 3: "Tickets table not found"');
console.log('    → Solution: Run the database migration');
console.log('    → Check: Supabase Dashboard > SQL Editor\n');

console.log('  Issue 4: "Network error"');
console.log('    → Solution: Check internet connection');
console.log('    → Check: Browser DevTools > Network tab\n');

console.log('  Issue 5: "Files cannot be uploaded"');
console.log('    → Solution: Check storage bucket permissions');
console.log('    → Check: Supabase Dashboard > Storage\n');

// 5. How to debug
console.log('5️⃣ How to Debug:\n');
console.log('  1. Open browser DevTools (F12)');
console.log('  2. Go to Console tab');
console.log('  3. Try creating a ticket');
console.log('  4. Look for error messages in red');
console.log('  5. Check the error details and message\n');

console.log('  Network Debugging:');
console.log('  1. Open DevTools > Network tab');
console.log('  2. Clear network log');
console.log('  3. Try creating a ticket');
console.log('  4. Look for failed requests (red text)');
console.log('  5. Click on request to see response error\n');

// 6. Logs to check
console.log('6️⃣ Check These in Browser Console:\n');
console.log('  - Look for: "Error creating ticket: ..."');
console.log('  - Look for: "Ticket insert error: ..."');
console.log('  - Look for: "not authenticated"');
console.log('  - Look for: "permission denied"');
console.log('  - Look for: "CORS error"\n');

console.log('═════════════════════════════════════════════════════════════\n');
console.log('✅ Run Test Directly:\n');
console.log('  cd src');
console.log('  node -e "import(\'/services/tickets.js\')"');
console.log('\n');

console.log('📚 Check Documentation:');
console.log('  - MANUAL_LOGIN_SETUP.md');
console.log('  - CREATE_TICKET_REDIRECT.md');
console.log('  - Check: Supabase configuration\n');
