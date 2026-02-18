# 🔧 Fix Google Sign-In Error - Quick Guide

## The Error You're Seeing:
```
Unable to exchange external code
```

This means **Google OAuth is not configured in Supabase**.

---

## ✅ Fix in 5 Steps (10 minutes)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Click **APIs & Services** → **Credentials** (left sidebar)
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - Choose **External**
   - Fill in app name: "Help Desk System"
   - Add your email
   - Save and continue
6. Back to create OAuth client ID:
   - Application type: **Web application**
   - Name: "Help Desk OAuth"
   - **Authorized redirect URIs**: Click **+ ADD URI** and add:
     ```
     https://zbvjkakyjvnmiabnnbvz.supabase.co/auth/v1/callback
     ```
7. Click **CREATE**
8. **COPY** the **Client ID** and **Client Secret** (keep this window open!)

---

### Step 2: Configure in Supabase

1. Go to [Supabase Authentication Providers](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/providers)
2. Find **Google** in the list
3. Click to expand
4. Toggle **Enable Google provider** ON
5. Paste your **Client ID** from Step 1
6. Paste your **Client Secret** from Step 1
7. Click **Save**

---

### Step 3: Configure Site URL

1. Go to [Supabase URL Configuration](https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/url-configuration)
2. Set **Site URL** to:
   ```
   http://localhost:5173
   ```
3. Add to **Redirect URLs** (one per line):
   ```
   http://localhost:5173
   http://localhost:5173/auth
   http://localhost:5173/**
   ```
4. Click **Save**

---

### Step 4: Restart Your Dev Server

```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

---

### Step 5: Test Google Sign-In

1. Go to http://localhost:5173/auth
2. Click **"Continue with Google"**
3. Choose your Google account
4. You should be redirected to the dashboard ✅

---

## 🔍 Troubleshooting

### Still seeing "Unable to exchange external code"?
- ✅ Double-check Client ID and Secret in Supabase
- ✅ Make sure "Enable Google provider" is toggled ON
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Try incognito/private browsing window

### "redirect_uri_mismatch" error?
- The redirect URI in Google Console must exactly match:
  ```
  https://zbvjkakyjvnmiabnnbvz.supabase.co/auth/v1/callback
  ```
- No trailing slash, must be HTTPS

### OAuth consent screen errors?
- Make sure you added at least one test user in Google Console
- Or publish your OAuth app (if you want anyone to sign in)

---

## ✨ Production Setup (When Deploying)

When you deploy your app:

1. **Add production redirect URI to Google Console:**
   ```
   https://YOUR-DOMAIN.com/auth/v1/callback
   ```

2. **Update Site URL in Supabase:**
   ```
   https://YOUR-DOMAIN.com
   ```

3. **Add production redirect URLs:**
   ```
   https://YOUR-DOMAIN.com
   https://YOUR-DOMAIN.com/auth
   https://YOUR-DOMAIN.com/**
   ```

---

## 📚 More Help

- Full Supabase guide: `SUPABASE_SETUP.md`
- Google OAuth docs: https://cloud.google.com/docs/authentication
- Supabase Auth docs: https://supabase.com/docs/guides/auth
