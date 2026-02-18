# Supabase Email Configuration Guide

## ⚠️ CRITICAL: Your Supabase is Not Connected!

### The Problem
Your `.env` file has an **invalid Supabase anon key**. The current key format (`sb_publishable_...`) is incorrect and won't work.

**Also found:** Project ID mismatch between `.env` and `config.toml` - now fixed to use `zbvjkakyjvnmiabnnbvz`.

---

## 🔧 Quick Fix (5 Steps)

### Step 1: Go to Supabase Dashboard
Click this link: **[Your Supabase Project Settings](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/settings/api)**

### Step 2: Copy the Anon Key
On the API settings page, you'll see two keys:
- ✅ **anon** (public) - This is what you need!
- ❌ **service_role** - Don't use this one!

The **anon** key:
- Starts with `eyJhbGc...`
- Is about 300 characters long
- Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9...`

### Step 3: Update Your .env File
1. Open the `.env` file in your project root
2. Replace `YOUR_ANON_KEY_HERE` with the key you copied
3. Save the file

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://zbvjkakyjvnmiabnnbvz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M... (your full key)
```

### Step 4: Restart Dev Server
```bash
# Press Ctrl+C to stop the current server
# Then restart:
npm run dev
```

### Step 5: Test It
1. Go to http://localhost:5176/auth
2. The yellow warning banner should disappear
3. Try signing up - you should receive a confirmation email

---

## 📧 Email Configuration (After Fixing Anon Key)

### Option A: Disable Email Confirmation (Quick Dev Mode)

Perfect for testing without email hassle:

1. Go to [Auth Settings](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/users)
2. Click **Configuration** → **Authentication**  
3. Scroll to **Email Auth**
4. **Uncheck** "Enable email confirmations"
5. **Users will auto-login after signup** (no email needed!)

### Option B: Enable Email Confirmation (Production)

For proper email verification:

1. Same Auth Settings page
2. **Check** "Enable email confirmations"  
3. Configure SMTP (optional but recommended):
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Use Gmail, SendGrid, or Postmark
   - Test email delivery

---

## 🚨 Common Issues

### Issue: "Invalid API key"
- ❌ You copied the wrong key
- ✅ Make sure you copied the **anon** key, not service_role

### Issue: "Network request failed"  
- ❌ Project URL is wrong
- ✅ Should be: `https://zbvjkakyjvnmiabnnbvz.supabase.co`

### Issue: "User already registered"
- ❌ You signed up before but email wasn't confirmed
- ✅ Go to [Users page](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/users) and delete test users

### Issue: Emails not arriving
- Check spam folder
- Verify SMTP is configured (or disable email confirmation for dev)
- Check Supabase logs: Dashboard → Logs → Auth

---

## ✅ Verification Checklist

After updating .env:

- [ ] Yellow warning banner is gone from auth page
- [ ] Console shows no Supabase errors (press F12)
- [ ] Can sign up successfully
- [ ] Either receive email OR auto-login (depending on settings)
- [ ] Can sign in with created account

---

## 📞 Need Help?

1. **Check browser console** (F12 → Console tab) for errors
2. **Check Supabase logs**: [Project Logs](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/logs/explorer)
3. **Validate your key**: Should be ~300 chars starting with `eyJhbGc`

---

### Previous Configuration Issues Found and Fixed:

✅ **Fixed:** Changed project URL from `yoifuexgukjsfbqsmwrn` to correct `zbvjkakyjvnmiabnnbvz`  
✅ **Fixed:** Added loading timeout to prevent infinite loading  
✅ **Fixed:** Better error messages for auth failures  
⚠️ **Needs Your Action:** Replace `YOUR_ANON_KEY_HERE` in `.env` with your real anon key

1. Check **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Verify the **Confirmation email** template is active
3. Test by sending a test email from the dashboard
4. Check your spam/junk folder

#### 5. Common Email Issues

**Gmail Users:**
- Check spam folder
- Add `noreply@mail.app.supabase.io` to contacts
- Enable "Display images" in Gmail settings

**Using Custom SMTP:**
- Verify SMTP credentials are correct
- Check if SMTP port is not blocked (587 or 465)
- Enable "Less secure app access" for Gmail (if applicable)
- Use app-specific password for Gmail

**Supabase Free Tier:**
- Limited to 3 emails per hour for email auth
- Using multiple test accounts? Wait or upgrade plan

### 6. Restart Development Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The app should now:
- ✅ Load without infinite loading
- ✅ Send confirmation emails (if enabled)
- ✅ Auto-login users (if confirmation disabled)

---

## 🔐 Google OAuth Configuration

### Prerequisites
Before Google sign-in works, you must configure OAuth in your Supabase project.

### Setup Steps:

#### 1. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add Authorized redirect URIs:
   ```
   https://zbvjkakyjvnmiabnnbvz.supabase.co/auth/v1/callback
   ```
7. Copy your **Client ID** and **Client Secret**

#### 2. Configure in Supabase
1. Go to [Supabase Authentication Settings](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/providers)
2. Find **Google** in the providers list
3. Toggle **Enable Google Provider**
4. Paste your Google **Client ID**
5. Paste your Google **Client Secret**
6. Save changes

#### 3. Add Site URL (Important!)
1. Go to [Authentication → URL Configuration](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/url-configuration)
2. Set **Site URL** to your app URL:
   - Development: `http://localhost:5173` (or your port)
   - Production: Your deployed URL
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth`
   - `http://localhost:5173/`
   - (Add your production URLs too)

#### 4. Test Google Sign-In
1. Restart your dev server
2. Go to `/auth` page
3. Click "Continue with Google"
4. Authorize with your Google account
5. You should be redirected to the dashboard

### Troubleshooting Google OAuth

**"OAuth redirect URI mismatch"**
- Check that the redirect URI in Google Console matches your Supabase callback URL exactly

**"Sign in successful but not redirected to dashboard"**
- Check browser console for logs
- Verify Site URL is set correctly in Supabase
- Make sure redirect URLs include `/auth`

**"Error: redirect_uri_mismatch"**
- Add `http://localhost:5173/auth` to Google Console authorized redirect URIs
- Add Supabase callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

---

## Troubleshooting

### Page Loading Forever

**Fixed by:**
- Added 5-second timeout to prevent infinite loading
- Better error handling in authentication
- Proper async initialization with cleanup

### Email Verification Not Working

**Check:**
1. Is the Supabase anon key correct and complete?
2. Is email confirmation enabled in Supabase settings?
3. Are SMTP settings configured (if using custom domain)?
4. Check Supabase logs for delivery errors

### Still Having Issues?

1. Check browser console for errors: Press `F12` → Console tab
2. Check Supabase logs: Dashboard → Logs → Auth Logs
3. Verify database connection: Dashboard → Database → Connection pooler

---

## Current Configuration Status

⚠️ **Action Required:**
- Update `VITE_SUPABASE_ANON_KEY` in `.env` with the correct key from Supabase dashboard
- The current key format appears invalid (too short)

✅ **Fixed in Code:**
- Added loading timeout (5 seconds)
- Improved error messages
- Better auth state management
- Graceful error handling
