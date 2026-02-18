# 🚑 Ambulance Tracking - Quick Start

## 1. Apply Database Migration (Required)

```powershell
.\apply-ambulance-location-migration.ps1
```

Then go to Supabase Dashboard → SQL Editor → Paste → Run

---

## 2. Get Mapbox Token (Required)

1. Visit: https://account.mapbox.com/auth/signup/
2. Sign up (free, no credit card)
3. Copy your token from: https://account.mapbox.com/access-tokens/
4. Add to `.env`:
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnRva2VuIn0...
   ```
5. Restart server: `npm run dev`

---

## 3. Add Route (Optional but Recommended)

In your routing file:

```jsx
import { AdminAmbulanceMonitor } from '@/components/AdminAmbulanceMonitor';

// Add this route:
<Route 
  path="/ambulance-monitor" 
  element={
    <RoleBasedRoute requiredRole="staff">
      <AppLayout>
        <AdminAmbulanceMonitor />
      </AppLayout>
    </RoleBasedRoute>
  } 
/>
```

---

## ✅ That's It!

### Patient Flow:
Dashboard → Ambulance → Request → Use GPS → Submit → See Map

### Staff Flow:
`/ambulance-monitor` → Select Request → Manage → Get Location → Update

---

## 📋 What You Got

- ✅ Real-time GPS tracking
- ✅ Interactive maps (patient + admin view)
- ✅ Auto distance/ETA calculation
- ✅ Live updates (no refresh needed)
- ✅ Staff management interface
- ✅ Route visualization

---

## 🐛 Quick Fixes

**Map not loading?**
→ Check `.env` has Mapbox token, restart server

**GPS not working?**
→ Allow browser location permission, use HTTPS

**No updates?**
→ Check Supabase Realtime enabled in project

---

📖 **Full Documentation:** See `AMBULANCE_TRACKING_GUIDE.md`
