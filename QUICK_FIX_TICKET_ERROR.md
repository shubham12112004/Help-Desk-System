# 🆘 Quick Fix: "Something went wrong" When Creating Ticket

## STEP 1: See the Real Error (2 minutes)

**Open Browser Console to see what's actually wrong:**

1. Press `F12` on your keyboard
2. Click **Console** tab
3. Try creating a ticket again
4. **Look for red text** that says:
   - `Error creating ticket: ...`
   - `Ticket insert error: ...`
   - Any other error message in red

**Copy that error message** - the real error will tell us how to fix it.

---

## STEP 2: Match Your Error & Fix It

### If you see: `User not authenticated` or `session expired`
```
🔧 FIX: You need to log in again
  1. Go to Settings page
  2. Click "Sign Out"
  3. Refresh page (F5)
  4. Sign in again: admin@hospital.local / Admin@123456
  5. Try creating ticket again ✓
```

### If you see: `permission denied` or `RLS policy`
```
🔧 FIX: Database permissions issue
  1. Go to: https://app.supabase.com
  2. Select your project
  3. Go to: SQL Editor
  4. Run this query:
  
  ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
  
  5. Try creating ticket again ✓
  
  ⚠️ WARNING: Do this ONLY in development!
     For production, fix RLS policies properly.
```

### If you see: `relation "public.tickets" does not exist`
```
🔧 FIX: Database tables not created yet
  1. Go to: https://app.supabase.com
  2. Select your project
  3. Database > Tables
  4. Check if "tickets" table exists
  5. If NO → Read: SUPABASE_SETUP.md for database setup
  6. If YES → Check RLS policies (see above)
```

### If you see: `CORS error` or `Network error`
```
🔧 FIX: Connection problem
  1. Check internet connection
  2. Verify Supabase project is ACTIVE (not paused)
     - Go to app.supabase.com
     - Is project red/paused? → Click Resume
  3. Restart dev server:
     - Press Ctrl+C in terminal
     - Type: npm run dev
     - Press Enter
  4. Try again ✓
```

### If you see: `Cannot upload file` or `storage error`
```
🔧 FIX: File upload issue
  1. Create ticket WITHOUT files first
  2. If it works → File upload config issue
  3. If still fails → Database issue (see above)
```

### If you see: something else or very long technical error
```
🔧 FIX: Get help
  1. Copy the FULL error message
  2. Check: TICKET_CREATION_TROUBLESHOOTING.md
  3. Find your error type in that file
  4. Follow the fix for that error
```

---

## STEP 3: Most Likely Fix (99% of cases)

**99% of "something went wrong" errors are caused by:**

### **Problem 1: Not logged in** ❌ → **Solution: Log in again**
- Signs out when page refreshes (auto-login disabled)
- Check: Do you see "Sign in" button? → Need to log in again
- Fix: Sign in with admin@hospital.local

### **Problem 2: Database permissions** ❌ → **Solution: Disable RLS (dev only)**
- RLS policies blocking ticket creation
- Fix: Run `ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;`
- Then retry

### **Problem 3: Supabase paused** ❌ → **Solution: Resume project**
- Project is sleeping/paused
- Fix: Go to app.supabase.com, Resume the project
- Then retry

---

## TEST IT NOW

1. **Are you logged in?**
   - Check sidebar - do you see "Admin" or other pages?
   - No? → Go to /auth and sign in again
   
2. **Can you see Create Ticket page?**
   - Yes? → Try creating with minimal data:
     - Title: `Test`
     - Description: `Test ticket`
     - Click Submit
   
3. **What error do you see?**
   - In Console (F12) look for red text
   - Apply fix from STEP 2 above

---

## ✅ SHOULD WORK LIKE THIS

✓ Click Submit  
✓ See loading spinner  
✓ Green message: "Ticket created successfully!"  
✓ Redirected to /tickets  
✓ Your ticket shows in the list  

If you don't see this → You found the error, apply fix above

---

## 📞 Need More Help?

1. **Read full guide**: `TICKET_CREATION_TROUBLESHOOTING.md`
2. **Check setup**: `MANUAL_LOGIN_SETUP.md`
3. **Verify Supabase**: `SUPABASE_SETUP.md`

---

**Next:** Open F12, try creating a ticket, note the error, and apply the fix above! 🚀
