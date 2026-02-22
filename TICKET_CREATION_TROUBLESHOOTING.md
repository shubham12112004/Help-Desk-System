# 🔴 Ticket Creation Error - Troubleshooting Guide

## ❌ Your Error: "Something went wrong"

This is a generic error message. We need to find the **actual error** to fix it.

---

## 🔍 STEP 1: Find the Real Error Message

### In Browser Console:
1. **Open DevTools**: Press `F12`
2. **Go to Console tab**: Look for red error messages
3. **Look for any text containing**:
   - "Error creating ticket"
   - "Ticket insert error"
   - "not authenticated"
   - "permission denied"
   - "CORS error"

### Take Note of:
- The full error message
- Any error code or status
- Stack trace (if shown)

---

## 🔴 COMMON CAUSES & FIXES

### **PROBLEM 1: "User not authenticated" or similar**

**Cause:** You're not logged in now or session expired

**Fix:**
1. Check that you're still logged in
2. If not, log in again with:
   - Email: `admin@hospital.local`
   - Password: `Admin@123456`
3. Try creating ticket again

**Verification:**
- Check that sidebar shows "Admin" (not "Sign in")
- Check browser console: No auth errors

---

### **PROBLEM 2: "permission denied" or "RLS policy violation"**

**Cause:** Database Row Level Security (RLS) policy blocking insert

**Fix - Via Supabase Dashboard:**
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Database > Tables**
4. Find: **tickets** table (if it exists)
5. Click on it
6. Go to: **RLS Policies** tab
7. Check if policies exist and are enabled
8. If missing, run the migration:
   ```bash
   cd your-project
   npm install supabase
   supabase db pull
   supabase db push
   ```

**Alternative - Check via SQL:**
1. Go to: **SQL Editor**
2. Run this query:
   ```sql
   -- Check RLS status
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets';
   
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'tickets';
   
   -- Try direct insert (test)
   INSERT INTO public.tickets (title, description, priority, status, created_by, category, department)
   VALUES ('Test', 'Test ticket', 'medium', 'open', auth.uid(), 'general', 'general');
   ```

---

### **PROBLEM 3: "Tickets table not found" or relation error**

**Cause:** Database table doesn't exist or migration not run

**Fix:**
1. Go to: Supabase Dashboard > SQL Editor
2. Run the full migration:
   ```bash
   # This creates the tickets table and all related tables
   ```
3. Or check if `tickets` table exists:
   - Go to: **Database > Tables**
   - Look for: **tickets** table
   - If missing: **Run the migration from migrations folder**

**Check Table Structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets';
```

---

### **PROBLEM 4: "Network error" or timeout**

**Cause:** Can't reach Supabase or very slow connection

**Fix:**
1. Check internet connection
2. Verify Supabase project is active:
   - Go to: https://app.supabase.com
   - Select your project
   - If it says "Paused" → Click "Resume"
3. Check .env variables:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
4. Restart dev server:
   ```bash
   Ctrl+C
   npm run dev
   ```

---

### **PROBLEM 5: "Files cannot be uploaded" (if attaching files)**

**Cause:** Storage bucket permissions or not configured

**Fix:**
1. Go to: Supabase Dashboard > Storage
2. Check if **ticket-attachments** bucket exists
3. If missing, create it:
   - Click **New Bucket**
   - Name: `ticket-attachments`
   - Make it **Public** (for easy access)
4. Set RLS policies on bucket

---

## 🧪 STEP 2: Test with Simpler Form

Try creating ticket with **minimal data**:

1. **Title**: `Test Ticket` (required)
2. **Description**: `Testing ticket creation` (required)
3. **Priority**: `Medium` (should auto-select)
4. **Department**: `General` (should auto-select)
5. **No files** - don't attach anything yet
6. Click **Submit**

If this works → Problem is with file upload or complex data
If still fails → Problem is with core ticket creation

---

## 🔧 STEP 3: Check Specific Components

### Check useTickets Hook
```javascript
// Run in browser console
const query = import.meta.glob['../hooks/useTickets.js']?.();
// Should load without errors
```

### Check if Service is Working
Go to browser console and run:
```javascript
// Can you import Supabase?
import { supabase } from '/integrations/supabase/client.js';
// Check if connection works
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

---

## 📊 CHECKLIST - Is Everything Set Up?

- [ ] **Supabase Project Created**: Yes / No
- [ ] **.env file has credentials**: Yes / No
- [ ] **Logged in as admin**: Yes / No
- [ ] **Database tables created**: Yes / No
  - [ ] tickets
  - [ ] profiles
  - [ ] user_roles
- [ ] **RLS Policies enabled**: Yes / No
- [ ] **Storage bucket created**: Yes / No
- [ ] **Supabase project NOT paused**: Yes / No

---

## 📞 GET DETAILED ERROR INFO

### From Console (F12 > Console):

When you try to create a ticket, look for errors like:
```
❌ Error creating ticket: [actual error here]
```

Copy the **full error message** and check against solutions above.

### From Network Tab (F12 > Network):

1. Clear network log
2. Try creating ticket
3. Look for red requests
4. Click on request → Response tab
5. See what error Supabase returned

Common responses:
- `403` → Permission denied (RLS policy)
- `404` → Table not found
- `500` → Server error
- `CORS error` → Configuration issue

---

## 🎯 QUICK FIXES (Try These First)

**Fix 1: Re-login**
```
1. Sign out (Settings > Sign Out)
2. Refresh page (F5)
3. Sign in again
4. Try creating ticket
```

**Fix 2: Clear Browser Cache**
```
1. F12 > Application > Storage
2. Click "Clear All"
3. Refresh (F5)
4. Sign in
5. Try again
```

**Fix 3: Restart Dev Server**
```
1. Ctrl+C to stop
2. npm run dev
3. Refresh browser
4. Try again
```

**Fix 4: Check Supabase Status**
```
1. Go to app.supabase.com
2. Is your project paused? → Click Resume
3. Is it active? → Can see tables and data
4. Try again
```

---

## 📚 Related Documentation

- `MANUAL_LOGIN_SETUP.md` - Login setup (required first)
- `CREATE_TICKET_REDIRECT.md` - Redirect flow
- `SUPABASE_SETUP.md` - Supabase configuration

---

## 🆘 If Nothing Works

**Detailed Debug Steps:**

1. **Take screenshot** of the error
2. **Copy full error message** from console
3. **Note your Supabase project URL**
4. **Check these logs**:
   - Browser console
   - Network tab responses
   - Supabase logs

5. **Verify these are working**:
   - Can you sign in? (Yes/No)
   - Can you see Dashboard? (Yes/No)
   - Can you see Tickets page? (Yes/No)
   - Can you see Create Ticket page? (Yes/No)
   - Where does error appear? (On submit / automatically)

---

## ✅ EXPECTED BEHAVIOR (When Working)

### Step-by-Step:
1. ✓ Go to /create page (automatically loads)
2. ✓ Fill in Title and Description
3. ✓ Select Priority and Department
4. ✓ Click Submit
5. ✓ Loading spinner appears
6. ✓ Toast message shows "Ticket created successfully!"
7. ✓ Redirects to /tickets page
8. ✓ Your new ticket appears in list

### If You See:
- ❌ Toast error → Check error message (from Fix sections above)
- ❌ Page stays on /create → Error during submit (check console)
- ❌ Redirects but ticket not in list → Database didn't save properly

---

**Now open F12 console and try creating a ticket again.**
**Look for the actual error message and apply the fix above.**
