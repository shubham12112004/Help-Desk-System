# 🚀 Manual Login Setup - Complete Guide

## ✅ Changes Made

**Auto-login has been DISABLED!**

The following files have been modified to require **manual sign-up or sign-in**:

### Modified Files:
1. **`src/hooks/useAuth.jsx`**
   - Disabled automatic session restoration on app load
   - Disabled cross-tab auto-login sync
   - Disabled visibility change auto-login

2. **`src/components/ProtectedRoute.jsx`**
   - Disabled session check on route protection
   - Requires manual login for protected routes

---

## 📝 Step-by-Step: Create Admin User

### Step 1: Sign Up Through UI
1. Open browser to **`http://localhost:5174/`**
2. Click **"Don't have an account? Sign up"**
3. Fill in details:
   - **Email**: `admin@hospital.local`
   - **Full Name**: `Admin Dashboard`
   - **Password**: `Admin@123456`
   - **Role**: Select **"Staff"** first (to access dashboard), then upgrade to Admin
4. Click **"Sign Up"**
5. Verify email if required (check console for any errors)

### Step 2: Upgrade to Admin (Database)

After creating the user via UI, upgrade their role in Supabase:

**Option A: Using Supabase Dashboard**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run this query:

```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@hospital.local';

-- Then update the role (replace 'USER_ID_HERE' with actual ID from above)
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'USER_ID_HERE';
```

**Option B: Using the setup script**
1. Edit `setup-admin-user.sql`
2. Replace `'REPLACE_WITH_AUTH_USER_ID'` with the actual user ID
3. Run the SQL in Supabase SQL Editor

---

## 🧪 Testing Manual Login

### Test Basic Sign-Up/Sign-In
1. **Clear browser data** (localStorage/sessionStorage)
   - F12 > Application > Clear All
2. Refresh page
3. You should be at the **Auth/Login page**
4. Sign in with:
   - **Email**: `admin@hospital.local`
   - **Password**: `Admin@123456`

### Test No Cross-Tab Login
1. Open **2 browser tabs** to `http://localhost:5174/`
2. **Tab 1**: Sign in
3. **Tab 2**: Should still show Login page (no auto-sync)
4. **Tab 2**: Manually sign in with same credentials

---

## 📊 Access Admin Dashboard

Once logged in as admin:

1. **Desktop View**: Click **"Admin"** in sidebar
2. **Mobile View**: Click hamburger menu → **"Admin"**
3. You'll see the Admin Dashboard with analytics and management features

### Admin Features Available:
- ✅ View all tickets
- ✅ View user analytics
- ✅ Manage staff assignments
- ✅ View system metrics
- ✅ Access admin controls

---

## 🔐 User Roles Reference

| Role | Email Format | Capabilities |
|------|---------|--------------|
| **Citizen** | any@email.com | Create tickets, view own tickets |
| **Staff** | staff@hospital.local | Handle tickets, view all tickets |
| **Admin** | admin@hospital.local | Full system access, analytics, user management |
| **Doctor** | doctor@hospital.local | Medical records, patient management |

---

## ⚙️ Environment Verification

Make sure these are set in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Check status by clicking **"Settings"** in app → Should show "Connected"

---

## 🐛 Troubleshooting

### Problem: Still auto-logging in
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Check DevTools > Application > Clear All Storage
3. If still persists, restart dev server: `npm run dev`

### Problem: Can't access admin dashboard
**Solution**:
1. Verify user role is 'admin' in database:
```sql
SELECT user_id, role FROM public.user_roles WHERE role = 'admin';
```
2. If not admin, update: `UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'YOUR_ID';`

### Problem: Sign up fails
**Solution**:
1. Check Supabase configuration in `.env`
2. Open DevTools Console (F12) and look for errors
3. Check Supabase Dashboard > Authentication > Email Templates are configured

---

## 🎯 Next Steps

1. ✅ **Sign up as admin** using the UI
2. ✅ **Upgrade admin role** in database
3. ✅ **Clear browser cache** and refresh
4. ✅ **Log in manually** with admin credentials
5. ✅ **Access admin dashboard** from sidebar
6. ✅ **Test other user types** (citizen, staff, doctor)

---

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify Supabase connection in Settings page
3. Review database queries in Supabase SQL Editor
4. Check auth logs in Supabase Dashboard

**Happy testing! 🎉**
