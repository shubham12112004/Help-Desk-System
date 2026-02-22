# ⚡ QUICK START - Manual Login Setup

## 🎯 What You Need To Do

### Step 1: Sign Up as Admin (5 minutes)
```
Go to: http://localhost:5174
Click: "Don't have an account? Sign up"

Fill in:
- Email: admin@hospital.local
- Full Name: Admin Dashboard
- Password: Admin@123456
- Role: Staff (can upgrade later)

Click: "Sign Up"
```

### Step 2: Upgrade to Admin (via Supabase)
```
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: SQL Editor
4. Copy & Run this:

SELECT id, email FROM auth.users WHERE email = 'admin@hospital.local';
// Copy the ID from result

UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '[PASTE_ID_HERE]';
```

### Step 3: Log In (5 minutes)
```
1. Clear browser cache (F12 > Storage > Clear All)
2. Refresh the page: http://localhost:5174
3. Click "Sign In"
4. Email: admin@hospital.local
5. Password: Admin@123456
6. Click "Sign In"
```

### Step 4: Access Admin Dashboard
```
1. After login, look at sidebar
2. Click: "Admin" (on desktop) or hamburger menu (mobile)
3. You should see: Admin Dashboard with analytics
```

---

## ✅ Verification

### Sign-Up Complete When:
- ✓ You see "Welcome to Dashboard" page
- ✓ You can click on "Admin" in sidebar

### Admin Dashboard Shows:
- ✓ Total tickets count
- ✓ Tickets by status (Open, In Progress, Resolved, Closed)
- ✓ Staff performance metrics
- ✓ Recent activity
- ✓ System health status

---

## 🔑 Credentials

| Field | Value |
|-------|-------|
| Email | `admin@hospital.local` |
| Password | `Admin@123456` |
| Role | Admin |
| Dashboard | `/admin` |

---

## ⚠️ Important Notes

✅ **Auto-login is NOW DISABLED**
- Each time you refresh, you must log in manually
- No cross-tab auto-sync
- Each browser tab needs manual login

✅ **Only one email registration required**
- Sign up once with admin@hospital.local
- Then you can test other features

✅ **All features work**
- Tickets, appointments, emergency, pharmacy, etc.
- But need to be logged in first

---

## 📍 Dev Server Status

**Dev Server**: http://localhost:5174  
**Status**: ✅ Running  
**Port**: 5174  

All tests passing! ✅

---

**Questions?** Check `MANUAL_LOGIN_SETUP.md` for detailed instructions
