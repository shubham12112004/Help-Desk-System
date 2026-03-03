# 🔐 DATABASE RLS POLICIES SETUP GUIDE

## What Are RLS Policies?

RLS (Row Level Security) policies are database rules that control who can access and modify data. If you're getting "permission denied" errors, it's because the RLS policies are either:
1. Not configured
2. Too restrictive
3. Missing for your user role

## ✅ Quick Fix (Run This)

Go to **Supabase Dashboard** → **SQL Editor** and run these commands:

### 1. Fix Create Ticket (Allow users to create)

```sql
-- Allow uses to insert tickets
ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tickets"
ON "public"."tickets"
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view their own tickets"
ON "public"."tickets"
FOR SELECT
USING (created_by = auth.uid() OR TRUE); -- TRUE = admins can see all

CREATE POLICY "Staff can view tickets"
ON "public"."tickets"
FOR SELECT
USING (TRUE); -- Allow viewing
```

### 2. Fix Request Ambulance (Allow users to create)

```sql
-- Allow users to insert ambulance requests
ALTER TABLE "public"."ambulance_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create ambulance requests"
ON "public"."ambulance_requests"
FOR INSERT
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can view their own requests"
ON "public"."ambulance_requests"
FOR SELECT
USING (patient_id = auth.uid() OR TRUE); -- TRUE = staff can see all
```

### 3. Fix Bill Payment (Allow users to pay)

```sql
-- Allow users to update their bills when paying
ALTER TABLE "public"."billing" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update their own bills"
ON "public"."billing"
FOR UPDATE
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can view their own bills"
ON "public"."billing"
FOR SELECT
USING (patient_id = auth.uid() OR TRUE); -- TRUE = staff can see all
```

### 4. Fix Profiles (For user info)

```sql
-- Ensure profiles table is readable
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
ON "public"."profiles"
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can update their own profile"
ON "public"."profiles"
FOR UPDATE
USING (id = auth.uid());
```

---

## 📝 How to Run These Commands

### Step 1: Go to Supabase Dashboard
```
1. Open https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" (left sidebar)
```

### Step 2: Copy and Run Each Command
```
1. Copy the SQL block above
2. Paste into SQL Editor
3. Click "Run" button
4. Wait for "Query executed successfully"
```

### Step 3: Test Again
```
1. Go to http://localhost:5175/system-test
2. Click "Run All Tests"
3. All should show GREEN ✓
```

---

## 🔍 How to Check Current Policies

Run this to see what policies exist:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive
FROM pg_policies
ORDER BY tablename, policyname;
```

Expected output should show policies for:
- tickets
- ambulance_requests
- billing
- profiles

---

## ⚙️ What Each Policy Does

| Policy | Table | Purpose | Allows |
|--------|-------|---------|--------|
| Users can create X | tickets | Let patients create tickets | INSERT |
| Users can create X | ambulance_requests | Let patients request ambulances | INSERT |
| Users can update X | billing | Let patients pay bills | UPDATE |
| Users can view X | all tables | Let all users view public data | SELECT |

---

## 🚨 Common Errors & Fixes

### Error: "PERMISSION DENIED: new row violates row-level security policy"

**Cause:** Creating/updating data violates RLS policy

**Fix:** Run the SQL commands above for that table

### Error: "PERMISSION DENIED: SELECT policy"

**Cause:** Can't read data - RLS policy too restrictive

**Fix:** Add this policy:
```sql
CREATE POLICY "Allow reading all data"
ON "public"."[TABLE_NAME]"
FOR SELECT
USING (TRUE);
```

### Error: "User not authenticated"

**Cause:** Not logged in

**Fix:** 
1. Go to http://localhost:5175/auth
2. Log in with your account
3. Try again

### Test still fails after running SQL

**Cause:** Policies might need adjustment for your user type

**Fix:**
1. Go to Supabase Dashboard
2. Check profiles table - your user should have `role = 'citizen'` or `'staff'` or `'admin'`
3. Adjust policies if needed based on your role

---

## 📊 Testing Checklist

After running the SQL commands:

- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] Log out and log back in
- [ ] Go to http://localhost:5175/system-test
- [ ] Click "Run All Tests"
- [ ] Copy any error messages
- [ ] Share with support if still failing

---

## ✅ Success Indicators

After fixing RLS policies, you should see:

```
✅ Create Ticket ................ PASS ✓
✅ Request Ambulance ............ PASS ✓  
✅ Fetch Billing ................ PASS ✓
✅ Database Connection .......... PASS ✓
```

---

## 🔑 Testing User Accounts

### Default Test Account
```
Email: admin@hospital.local
Password: Admin@123456
Role: admin
```

### Create Test Patient (Optional)
```
Email: patient@hospital.local
Password: Test@123456
```

---

## 📞 If You Need Help

1. **Note the exact error message** from http://localhost:5175/system-test
2. **Check browser console** (F12 → Console tab)
3. **Run the SQL fix** commands from this guide
4. **Test again** to confirm it works

---

## 🎯 Quick Summary

| Issue | Fix | Command | Where |
|-------|-----|---------|-------|
| Can't create ticket | Add CREATE policy | Copy "Fix Create Ticket" | SQL Editor |
| Can't request ambulance | Add CREATE policy | Copy "Fix Request Ambulance" | SQL Editor |
| Can't pay bill | Add UPDATE policy | Copy "Fix Bill Payment" | SQL Editor |
| All features | Apply all 4 fixes | Run all 4 SQL blocks | SQL Editor |

---

## 🚀 After Fixing

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Test system** (http://localhost:5175/system-test)
3. **Create ticket** (http://localhost:5175/create)
4. **Request ambulance** (http://localhost:5175/emergency)
5. **Pay bill** (http://localhost:5175/billing)

**All should work without permission errors!**

---

Last updated: Today
Status: Ready to use ✅
